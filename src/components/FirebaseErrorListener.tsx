'use client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useI18n } from '@/contexts/i18n-provider';

export function FirebaseErrorListener() {
  const { toast } = useToast();
  const { dictionary } = useI18n();

  useEffect(() => {
    const handler = (error: Error) => {
      if (error instanceof FirestorePermissionError) {
        console.error('Firestore Permission Error:', error.context);
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description:
            process.env.NODE_ENV === 'development'
              ? error.message
              : "You don't have permission to perform this action.",
        });
      } else {
        console.error('An unexpected error occurred:', error);
        toast({
          variant: 'destructive',
          title: dictionary.errors.genericTitle,
          description: dictionary.errors.genericDescription,
        });
      }
    };
    errorEmitter.on('permission-error', handler);

    return () => {
      errorEmitter.off('permission-error', handler);
    };
  }, [toast, dictionary]);

  return null;
}
