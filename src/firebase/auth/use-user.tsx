'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from '@/firebase';

export function useUser() {
  const { auth } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
            setUser(user);
            const token = await user.getIdToken();
            setIdToken(token);
        } else {
            setUser(null);
            setIdToken(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setUser(null);
        setIdToken(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, idToken, loading };
}
