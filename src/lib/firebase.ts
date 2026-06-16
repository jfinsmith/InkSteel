// Guarded Firebase client. Initializes lazily on the browser using the PUBLIC_*
// env vars. Firebase web config is public by design — real protection comes from
// Firestore Security Rules (see firestore.rules), not from hiding these keys.
// If the project isn't configured yet, every helper degrades gracefully (no-op).
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

/** True once the six PUBLIC_FIREBASE_* vars are present in the build. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

/** Returns a Firestore instance, or null if Firebase isn't configured yet. */
export function getDb(): Firestore | null {
  if (!isFirebaseConfigured) return null;
  if (!db) {
    app = getApps().length ? getApps()[0] : initializeApp(config);
    db = getFirestore(app);
  }
  return db;
}
