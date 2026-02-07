'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useI18n } from '@/firebase';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691c-1.328 2.291-2.094 4.904-2.094 7.619s.766 5.328 2.094 7.619l-5.657 5.657C.139 31.898 0 28.028 0 24s.139-7.898 1.18-11.309z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657A12.015 12.015 0 0 1 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.657 5.657C42.482 34.623 44 30.061 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { auth, firestore } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { dictionary } = useI18n();

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: dictionary.pages.login.errors.firebaseNotInitialized,
        description: 'Please check your Firebase configuration.',
      });
      return;
    }
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
    provider.addScope('https://www.googleapis.com/auth/drive');
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user profile in Firestore
      const userRef = doc(firestore, 'users', user.uid);
      const userData = {
        displayName: user.displayName,
        email: user.email,
      };

      try {
        await setDoc(userRef, userData, { merge: true });
      } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'write',
          requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      let description;
      if (error.code === 'auth/popup-closed-by-user') {
        description = dictionary.pages.login.errors.popupClosed;
      } else if (error.code === 'auth/popup-blocked') {
        description = dictionary.pages.login.errors.popupBlocked;
      } else {
        description = dictionary.errors.genericDescription;
      }
      toast({
        variant: 'destructive',
        title: dictionary.pages.login.errors.signInFailed,
        description: description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <Logo className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="font-headline text-2xl">{dictionary.pages.login.title}</CardTitle>
        <CardDescription>{dictionary.pages.login.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGoogleSignIn}
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-5 w-5" />
          )}
          {loading ? dictionary.pages.login.signingInButton : dictionary.pages.login.signInButton}
        </Button>
      </CardContent>
      <CardFooter className="flex-col items-center gap-4">
        <Button variant="link" asChild>
          <Link href="/">{dictionary.pages.login.backToHome}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
