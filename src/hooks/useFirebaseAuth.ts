// ─────────────────────────────────────────────────────────────────────────
// Firebase Authentication Hook — QuoteFlow ERP
// Supports Google Sign-In + Email/Password
// ─────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import {
  signInWithPopup, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, User,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, error, signInWithGoogle, signInWithEmail, logout };
}
