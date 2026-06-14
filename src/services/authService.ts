import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { UserProfile } from '../types/firebase';

const userDoc = (uid: string) => doc(getFirebaseDb(), 'users', uid);

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email.trim(),
    password
  );
  await setDoc(userDoc(credential.user.uid), {
    displayName,
    relationshipId: null,
    createdAt: serverTimestamp(),
  });
  return credential.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    email.trim(),
    password
  );
  return credential.user;
};

export const signOut = (): Promise<void> => firebaseSignOut(getFirebaseAuth());

export const subscribeToAuth = (callback: (user: User | null) => void): (() => void) =>
  onAuthStateChanged(getFirebaseAuth(), callback);

export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    displayName: data.displayName ?? 'You',
    relationshipId: data.relationshipId ?? null,
    partnerDisplayName: data.partnerDisplayName,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.(),
  };
};

export const updateUserProfile = async (
  uid: string,
  patch: Partial<UserProfile>
): Promise<void> => {
  await setDoc(userDoc(uid), patch, { merge: true });
};
