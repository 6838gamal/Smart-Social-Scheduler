'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  firestore: null,
  auth: null,
});

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).firebaseApp;
export const useFirestore = () => useContext(FirebaseContext).firestore;
export const useAuth = () => useContext(FirebaseContext).auth;

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export function FirebaseProvider({
  children,
  firebaseApp,
  firestore,
  auth,
}: FirebaseProviderProps) {
  const value = { firebaseApp, firestore, auth };

  return (
    <FirebaseContext.Provider value={value}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}
