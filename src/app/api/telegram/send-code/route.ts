
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getTelegramClient } from '@/lib/telegram-client';

if (!getApps().length) {
  initializeApp();
}

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!idToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await getAuth().verifyIdToken(idToken);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
  
  const { phoneNumber } = await req.json();
  if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  const { client } = getTelegramClient();

  try {
    await client.connect();
    
    // The library handles the phoneCode a bit differently than what we expect. 
    // We pass a function that will be called if the code is needed.
    // However, for the initial `sendCode`, we don't need to provide it.
    // We only need the `phoneCode` function when we actually sign in.
    const result = await client.sendCode(
      {
        apiId: parseInt(process.env.API_ID!),
        apiHash: process.env.API_HASH!,
      },
      phoneNumber
    );
    
    return NextResponse.json({ phoneCodeHash: result.phoneCodeHash });

  } catch (error: any) {
    console.error("Error sending Telegram code:", error);
    const errorMessage = error.errorMessage || error.message || 'Failed to send verification code.';
    // Provide more specific error messages
    if (errorMessage.includes('PHONE_NUMBER_INVALID')) {
      return NextResponse.json({ error: 'The phone number is invalid.' }, { status: 400 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
      if(client.connected){
        await client.disconnect();
      }
  }
}
