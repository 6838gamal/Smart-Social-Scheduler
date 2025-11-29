'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  type DocumentReference,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';

export function useDoc<T>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe;
    try {
      unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          if (doc.exists()) {
            setData({ ...doc.data(), id: doc.id } as T);
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching document:', err);
          setError(err);
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Error setting up snapshot:', err);
      setError(err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [docRef]);

  return { data, loading, error };
}
