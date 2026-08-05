import React, { useState } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

export function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, signInAsDemoAdmin, loading, error } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmail, setShowEmail] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmail(email, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '10%', width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%', width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          animation: 'pulse 6s ease-in-out infinite',
        }} />
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24,
        padding: '40px 32px', width: '100%', maxWidth: 440,
        textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 18,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>
            <span style={{ fontSize: 32 }}>⚡</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            QuoteFlow ERP
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0 }}>
            ZIPCON SERVICES PRIVATE LIMITED
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 20, padding: '4px 12px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#86efac', fontSize: 11, fontWeight: 500 }}>Cloud & Desktop System</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 18,
            color: '#fca5a5', fontSize: 13, textAlign: 'left', lineHeight: '1.4',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ Authentication Notice</div>
            <div>{error}</div>
          </div>
        )}

        {/* 1. Quick Instant Login (Always Works) */}
        <button
          onClick={() => signInAsDemoAdmin('Admin')}
          style={{
            width: '100%', padding: '14px 20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            border: 'none', borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: '#fff', fontSize: 15, fontWeight: 600,
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            marginBottom: 14, transition: 'all 0.2s',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
          <span>⚡</span>
          <span>Quick Admin Sign-In (Instant Access)</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>or Firebase Auth</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* 2. Google Sign-In */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '13px 20px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            color: '#fff', fontSize: 14, fontWeight: 600, transition: 'all 0.2s', marginBottom: 12,
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* 3. Email/Password toggle */}
        {!showEmail ? (
          <button onClick={() => setShowEmail(true)} style={{
            width: '100%', padding: '11px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
            cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13, transition: 'all 0.2s',
          }}>
            Sign in with Email & Password
          </button>
        ) : (
          <form onSubmit={handleEmailLogin} style={{ textAlign: 'left', marginTop: 10 }}>
            <input type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)} required
              style={{
                width: '100%', padding: '11px 14px', marginBottom: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
            <input type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)} required
              style={{
                width: '100%', padding: '11px 14px', marginBottom: 12,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              {loading ? 'Signing in...' : 'Sign In with Email'}
            </button>
          </form>
        )}

        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 22, marginBottom: 0 }}>
          🔒 QuoteFlow ERP Enterprise · ZIPCON Services
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.08);opacity:1} }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}
