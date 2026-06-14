# Firebase setup (Expo Go + JS SDK)

## 1. Create Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com).
2. **Add project** → name it (e.g. `between-app`).
3. Disable Google Analytics if you want (optional).

## 2. Enable services

### Authentication

1. **Build → Authentication → Get started**
2. **Sign-in method → Email/Password → Enable**

### Firestore

1. **Build → Firestore Database → Create database**
2. Start in **test mode** for development (replace rules below before production).
3. Choose a region close to you.

### Storage (for shared moments)

1. **Build → Storage → Get started**
2. Deploy rules from `firebase/storage.rules`:

```bash
firebase deploy --only storage
```

Or paste rules in the console under **Storage → Rules → Publish**.

## 3. Register a web app

1. Project **Settings** (gear) → **Your apps** → **Web** `</>`
2. App nickname: `BETWEEN`
3. Copy the `firebaseConfig` values.

## 4. Add keys to the project

```bash
cp .env.example .env
```

Fill `.env` with your values:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Restart Expo after changing `.env`:

```bash
npx expo start -c
```

## 5. Deploy Firestore rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. `firebase login`
3. `firebase init firestore` (select your project, use `firebase/firestore.rules`)
4. `firebase deploy --only firestore:rules,storage`

Or paste rules from `firebase/firestore.rules` and `firebase/storage.rules` in the console.

## 6. Gemini AI (free tier)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and create a **free API key**.
2. Add to `.env`:

```
EXPO_PUBLIC_GEMINI_API_KEY=your-key-here
```

3. Restart Expo: `npx expo start -c`

Powers **AI Letters** and **AI Story** (Gemini 2.0 Flash). For production, move the key to a backend proxy — never ship unrestricted keys in public apps.

## 7. Test with two phones

**Phone A (creates sanctuary)**

1. Sign up with email + password.
2. Complete onboarding; leave partner code **empty**.
3. Tap **Enter Sanctuary** → note the invite code in the alert.
4. Set mood on **Mood** tab.

**Phone B (joins)**

1. Sign up with a **different** email.
2. On the invite step, enter the code from Phone A.
3. Tap **Enter Sanctuary** → both should see each other’s mood update live.

## Without Firebase

If `.env` is missing or empty, the app runs **offline** (original local-only behavior).
