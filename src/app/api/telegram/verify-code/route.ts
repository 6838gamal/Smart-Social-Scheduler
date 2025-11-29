
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { Api } from 'telegram';
import { errors } from 'telegram/errors';
import { getTelegramClient } from '@/lib/telegram-client';


if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!idToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  const uid = decodedToken.uid;
  const { phoneNumber, phoneCode, phoneCodeHash, password } = await req.json();
  
  if (!phoneNumber || !phoneCode || !phoneCodeHash) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Use a new session for each login attempt.
  const { client, session } = getTelegramClient();

  try {
    await client.start({
        apiId: parseInt(process.env.API_ID!),
        apiHash: process.env.API_HASH!,
        phoneNumber: phoneNumber,
        phoneCode: async () => phoneCode,
        password: async () => {
            if (password) return password;
            // This error will be caught and signaled to the frontend.
            throw new errors.SessionPasswordNeededError();
        },
        onError: (err) => {
            throw err;
        }
    });

    const sessionString = session.save();
    const me = await client.getMe() as Api.User;
      
    if (!me) {
        throw new Error("Failed to get user details from Telegram.");
    }
    
    const connectionId = me.username || String(me.id);
    const connectionRef = db.collection("users").doc(uid).collection("connections").doc(connectionId);
    
    await connectionRef.set({
        connectionId: connectionId,
        provider: "telegram",
        username: me.username,
        firstName: me.firstName,
        lastName: me.lastName,
        connectedAt: new Date(),
    }, { merge: true });

    await connectionRef.collection("private").doc("session").set({ sessionString });
    
    return NextResponse.json({ success: true, message: "Telegram account connected successfully!" });

  } catch (error: any) {
    console.error("Error verifying Telegram code:", error);
    let errorMessage = error.errorMessage || error.message || 'Failed to verify code.';
    let status = 500;

    if (error instanceof errors.SessionPasswordNeededError) {
        errorMessage = 'SESSION_PASSWORD_NEEDED';
        status = 400;
    } else if (error instanceof errors.PhoneCodeInvalidError || errorMessage.includes('PHONE_CODE_INVALID')) {
        errorMessage = 'The verification code is invalid.';
        status = 400;
    } else if (error instanceof errors.PasswordHashInvalidError || errorMessage.includes('PASSWORD_HASH_INVALID')) {
        errorMessage = 'The 2FA password you entered is incorrect.';
        status = 400;
    }

    return NextResponse.json({ error: errorMessage }, { status });
  } finally {
       if(client.connected){
        await client.disconnect();
      }
  }
}
