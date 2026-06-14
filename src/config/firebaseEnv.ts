const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    (projectId ? `${projectId}.firebaseapp.com` : ''),
  projectId,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (projectId ? `${projectId}.firebasestorage.app` : ''),
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_NUMBER ??
    '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const appMeta = {
  projectName: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_NAME ?? 'Between',
  projectNumber: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_NUMBER ?? '',
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '',
};

export const isFirebaseConfigured = (): boolean =>
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
