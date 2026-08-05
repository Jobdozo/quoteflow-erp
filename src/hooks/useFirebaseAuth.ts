// ─────────────────────────────────────────────────────────────────────────
// Firebase Authentication Hook — QuoteFlow ERP
// Supports Google Sign-In, Email/Password, and Demo/Fallback Mode
// ─────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import {
  signInWithPopup, signInWithRedirect, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, User, signInAnonymously,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

// Mock user interface for Demo/Bypass mode if Firebase Auth fails or is unconfigured
export interface CustomUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

const DEMO_STORAGE_KEY = 'quoteflow_demo_user';

export function useFirebaseAuth() {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local demo user first
    const savedDemoUser = localStorage.getItem(DEMO_STORAGE_KEY);
    if (savedDemoUser) {
      try {
        setUser(JSON.parse(savedDemoUser));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
    }

    // 2. Firebase Auth Listener
    try {
      const unsub = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'ZIPCON Admin',
            photoURL: firebaseUser.photoURL,
          });
        } else if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
          setUser(null);
        }
        setLoading(false);
      });
      return unsub;
    } catch (err: any) {
      console.warn('Firebase Auth state error:', err);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error('Google Sign-In Popup Error:', e);
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          setError(redirectErr.message);
          return;
        }
      }
      if (e.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in Firebase Console yet. Please enable Google in Authentication -> Sign-in method.');
      } else if (e.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase Console -> Authentication -> Settings -> Authorized Domains.');
      } else {
        setError(e.message || 'Google Sign-In failed. Please try again or use Quick Demo Sign In.');
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      console.error('Email Sign-In Error:', e);
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setError('Invalid email or password. You can also click "Quick Sign In (Demo Admin)" below.');
      } else {
        setError(e.message || 'Authentication error.');
      }
    }
  };

  // Quick Demo / Admin Bypass Sign-In (always works even offline or before Firebase Auth is configured)
  const signInAsDemoAdmin = (role: 'Admin' | 'Sales Manager' = 'Admin') => {
    setError(null);
    const demoUser: CustomUser = {
      uid: 'demo-admin-zipcon-001',
      email: 'admin@zipcon.in',
      displayName: role === 'Admin' ? 'ZIPCON Admin' : 'Sales Manager',
      photoURL: null,
      isDemo: true,
    };
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  };

  return { user, loading, error, signInWithGoogle, signInWithEmail, signInAsDemoAdmin, logout };
}
