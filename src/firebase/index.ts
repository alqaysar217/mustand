
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  // Ensure config is valid before initializing
  const isValidConfig = firebaseConfig && firebaseConfig.projectId && firebaseConfig.projectId !== "PLACEHOLDER";
  
  const firebaseApp =
    getApps().length === 0 
      ? initializeApp(isValidConfig ? firebaseConfig : { projectId: 'archiva-smart-dummy' }) 
      : getApp();
      
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
