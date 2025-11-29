'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAt,
  startAfter,
  endAt,
  endBefore,
  type DocumentData,
  type Query,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';

export type UseCollectionOptions = {
  constraints?: QueryConstraint[];
};

export function useCollection<T>(
  queryRef: Query<T> | null,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedConstraints = useMemo(
    () => options?.constraints || [],
    [options?.constraints]
  );

  useEffect(() => {
    if (!queryRef) {
      setData(null);
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe;
    try {
      const q = query(queryRef, ...memoizedConstraints);

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map(
            (doc) => ({ ...doc.data(), id: doc.id } as T)
          );
          setData(docs);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching collection:', err);
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
  }, [queryRef, memoizedConstraints]);

  return { data, loading, error };
}
