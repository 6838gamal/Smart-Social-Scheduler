'use client';
import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, type DocumentReference, type DocumentData, doc } from 'firebase/firestore';
import { useAuth } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useDoc<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const { firestore } = useAuth();

  const docRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, path) as DocumentReference<T>;
  }, [firestore, path]);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data() as T;
          setData({ ...(docData as object), id: snapshot.id } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
        setData(null);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading };
}
