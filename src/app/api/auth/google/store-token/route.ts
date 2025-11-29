
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

// Correctly initialize Firebase Admin SDK for the environment
if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();
const adminAuth = getAdminAuth();

export async function POST(req: NextRequest) {
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const { accessToken, refreshToken, userEmail } = await req.json();

        if (!accessToken || !userEmail) {
            return NextResponse.json({ error: 'Missing access token or user email' }, { status: 400 });
        }

        const connectionRef = db
            .collection('users')
            .doc(uid)
            .collection('connections')
            .doc(userEmail);

        // Store public-facing connection data
        await connectionRef.set({
            connectionId: userEmail,
            provider: 'google',
            emailAddress: userEmail,
            connectedAt: new Date(),
            services: FieldValue.arrayUnion('gmail', 'drive'),
        }, { merge: true });
        
        // Store sensitive tokens in a private subcollection
        const tokensRef = connectionRef.collection('private').doc('tokens');
        
        const tokenData: { accessToken: string; refreshToken?: string } = { accessToken };
        if (refreshToken) {
            tokenData.refreshToken = refreshToken;
        }

        await tokensRef.set(tokenData, { merge: true });

        return NextResponse.json({ success: true, message: 'Token stored successfully.' });

    } catch (error: any) {
        console.error('Error storing token:', error);
        // Provide a more specific error message if available
        const errorMessage = error.message || 'Internal server error occurred while storing the token.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
