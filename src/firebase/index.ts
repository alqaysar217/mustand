'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * وظيفة تهيئة Firebase بشكل آمن جداً لمنع خطأ الانهيار (مثل trimEnd) عند غياب الإعدادات.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
} {
  // التحقق الصارم من الإعدادات قبل البدء
  const isValid = 
    firebaseConfig && 
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId && 
    firebaseConfig.projectId !== "YOUR_PROJECT_ID";
  
  if (!isValid) {
    // نرجع قيم فارغة بأمان لتجنب انهيار التطبيق
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.error("❌ فشل في تهيئة خدمات Firebase:", error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
