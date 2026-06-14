import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebaseEnv';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export const initFirebase = (): boolean => {
  if (!isFirebaseConfigured()) {
    return false;
  }
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  return true;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) throw new Error('Firebase Auth is not initialized. Add .env keys and restart Expo.');
  return auth;
};

export const getFirebaseDb = (): Firestore => {
  if (!db) throw new Error('Firebase Firestore is not initialized.');
  return db;
};

export const getFirebaseStorage = (): FirebaseStorage => {
  if (!storage) throw new Error('Firebase Storage is not initialized.');
  return storage;
};
