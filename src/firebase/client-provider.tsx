'use client';
import React, { useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { firebaseApp, auth, firestore } = useMemo(() => initializeFirebase(), []);

  if (!firebaseApp) {
    return <>{children}</>
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
};
