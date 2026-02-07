'use client';
import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, type Query, type DocumentData, type QuerySnapshot, collection } from 'firebase/firestore';
import { useAuth } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T>(path: string | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { firestore } = useAuth();

  const collectionQuery = useMemo(() => {
    if (!firestore || !path) return null;
    return query(collection(firestore, path));
  }, [firestore, path]);

  useEffect(() => {
    if (!collectionQuery || !path) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(collectionQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
        setData(docs);
        setLoading(false);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
        setData(null);
      }
    );

    return () => unsubscribe();
  }, [collectionQuery, path]);

  return { data, loading };
}
