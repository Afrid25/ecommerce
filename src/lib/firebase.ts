import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  // Add these values in `.env.local`; they are public Firebase web config values.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

export function getFirebaseApp() {
  if (!isFirebaseConfigured) {
    return null;
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export function getFirebaseAuth() {
  if (!firebaseAuth) {
    const app = getFirebaseApp();
    firebaseAuth = app ? getAuth(app) : null;
  }

  return firebaseAuth;
}
