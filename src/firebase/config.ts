// ─────────────────────────────────────────────────────────────────────────
// Firebase Configuration — QuoteFlow ERP
// Project: quoteflow-efec3 | Realtime DB: quoteflow-efec3-default-rtdb
// ─────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAnbAAWkGA740W2ZgDY-gwwy_9s_lTtav8",
  authDomain: "quoteflow-efec3.firebaseapp.com",
  projectId: "quoteflow-efec3",
  storageBucket: "quoteflow-efec3.firebasestorage.app",
  messagingSenderId: "306718996330",
  appId: "1:306718996330:web:6254b6d551810cd7ce1713",
  measurementId: "G-KEPWJ8E33B",
  databaseURL: "https://quoteflow-efec3-default-rtdb.firebaseio.com"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db        = getFirestore(app);
export const rtdb      = getDatabase(app);
export const auth      = getAuth(app);
export const storage   = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics initialized safely without blocking app load if restricted
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Default company document ID for ZIPCON Services
export const COMPANY_ID = 'zipcon-services-jmu';

export default app;
