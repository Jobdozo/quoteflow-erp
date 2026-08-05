// ─────────────────────────────────────────────────────────────────────────
// Firebase Configuration — QuoteFlow ERP
// Project: quoteflow-efec3 | Cloud SQL: us-east4 (Northern Virginia)
// ─────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAnbAAWkGA740W2ZgDY-gwwy_9s_lTtav8",
  authDomain: "quoteflow-efec3.firebaseapp.com",
  projectId: "quoteflow-efec3",
  storageBucket: "quoteflow-efec3.firebasestorage.app",
  messagingSenderId: "306718996330",
  appId: "1:306718996330:web:6254b6d551810cd7ce1713",
  measurementId: "G-KEPWJ8E33B"
};

// Initialize Firebase (guard against hot-reload duplicates)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db        = getFirestore(app);
export const auth      = getAuth(app);
export const storage   = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const googleProvider = new GoogleAuthProvider();

// Default company document ID for ZIPCON Services
export const COMPANY_ID = 'zipcon-services-jmu';

export default app;
