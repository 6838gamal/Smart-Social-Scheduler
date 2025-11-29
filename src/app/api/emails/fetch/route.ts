
'use server';
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    try {
        const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS 
            ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
            : undefined;

        if (serviceAccount) {
            initializeApp({ credential: cert(serviceAccount) });
        } else {
            initializeApp();
        }
    } catch (error) {
        console.error("Failed to initialize Firebase Admin SDK:", error);
    }
}

const db = getFirestore();
const auth = getAuth();

async function getRefreshedTokens(refreshToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
}

export async function POST(req: NextRequest) {
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }
    
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        const connectionsSnapshot = await db.collection('users').doc(uid).collection('connections')
            .where('provider', '==', 'google')
            .where('services', 'array-contains', 'gmail')
            .limit(1) // Assuming one Google connection for simplicity
            .get();

        if (connectionsSnapshot.empty) {
            return NextResponse.json({ error: 'No Gmail account connected.' }, { status: 404 });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        const connectionDoc = connectionsSnapshot.docs[0];
        const tokensRef = connectionDoc.ref.collection('private').doc('tokens');
        const tokensDoc = await tokensRef.get();
        const tokens = tokensDoc.data();
        
        if (!tokens || !tokens.access_token) {
            return NextResponse.json({ error: 'Token data is missing. Please reconnect your account.' }, { status: 400 });
        }

        // Check if the access token is expired or close to expiring
        if (tokens.expiry_date && tokens.expiry_date < (Date.now() + 60000)) {
            if (!tokens.refresh_token) {
                return NextResponse.json({ error: 'Authentication expired and cannot be refreshed. Please reconnect your Google account.' }, { status: 401 });
            }
            try {
                const newTokens = await getRefreshedTokens(tokens.refresh_token);
                oauth2Client.setCredentials(newTokens);
                // Save the potentially new tokens (including a new access token) back to Firestore
                await tokensRef.update({
                    access_token: newTokens.access_token,
                    expiry_date: newTokens.expiry_date,
                });
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                return NextResponse.json({ error: 'Failed to refresh authentication. Please reconnect your account.' }, { status: 401 });
            }
        } else {
            oauth2Client.setCredentials(tokens);
        }
        
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10,
            q: 'is:inbox',
        });

        const messages = response.data.messages || [];
        if (messages.length > 0) {
            const batch = db.batch();
            for (const message of messages) {
                if (!message.id) continue;
                const msg = await gmail.users.messages.get({ userId: 'me', id: message.id, format: 'full' });
                const { headers, payload, snippet } = msg.data;
                const subject = headers?.find(h => h.name === 'Subject')?.value || '';
                const fromHeader = headers?.find(h => h.name === 'From')?.value || '';
                const fromMatch = fromHeader.match(/(.*)<(.*)>/);
                const from = fromMatch ? fromMatch[1].trim() : fromHeader;
                const fromEmail = fromMatch ? fromMatch[2].trim() : fromHeader;
                const timestamp = headers?.find(h => h.name === 'Date')?.value;
                
                let content = snippet || '';
                if (payload?.parts) {
                    const part = payload.parts.find(p => p.mimeType === 'text/plain');
                    if (part && part.body?.data) {
                        content = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                } else if (payload?.body?.data) {
                     content = Buffer.from(payload.body.data, 'base64').toString('utf-8');
                }

                const emailRef = db.collection('users').doc(uid).collection('emails').doc(message.id);
                batch.set(emailRef, {
                    from,
                    fromEmail,
                    subject,
                    content: content.substring(0, 400), // Keep content reasonable
                    timestamp: new Date(timestamp || Date.now()),
                    read: !(msg.data.labelIds?.includes('UNREAD')),
                    platform: 'Email',
                }, { merge: true });
            }
            await batch.commit();
        }
        
        return NextResponse.json({ success: true, message: `${messages.length} emails fetched successfully.` });
    } catch (error: any) {
        console.error('Failed to fetch emails:', error);
        if (error.response?.data?.error === 'invalid_grant' || error.code === 401) {
             return NextResponse.json({ error: 'Authentication expired or invalid. Please reconnect your Google account.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'An internal error occurred while fetching emails.' }, { status: 500 });
    }
}
