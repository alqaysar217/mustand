'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * وظيفة تهيئة Firebase بشكل آمن.
 * إذا كانت الإعدادات عبارة عن "PLACEHOLDER"، سيعيد النظام قيم فارغة لمنع الانهيار.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore | null;
  auth: Auth | null;
} {
  // التحقق من صحة الإعدادات (التأكد من أنها ليست PLACEHOLDER)
  const isValidConfig = 
    firebaseConfig && 
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== "PLACEHOLDER" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "PLACEHOLDER";
  
  if (!isValidConfig) {
    console.warn("إعدادات Firebase غير مكتملة. يرجى وضع الإعدادات الصحيحة في src/firebase/config.ts");
    // تهيئة تطبيق وهمي لمنع الأخطاء البرمجية في المكونات التي تتوقع وجود تطبيق
    const app = getApps().length === 0 
      ? initializeApp({ projectId: 'archiva-smart-placeholder' }) 
      : getApp();
    return { firebaseApp: app, firestore: null, auth: null };
  }

  const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
