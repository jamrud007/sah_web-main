// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginAsync } from '../../store/authSlice';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector((s) => s.auth.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const result = await dispatch(loginAsync({ email: email.trim(), password }));
      if (loginAsync.fulfilled.match(result)) {
        navigate('/produk', { replace: true });
      } else {
        setError((result.payload as string) || 'Login gagal.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #17243a 60%, #1d2e46 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(197,138,99,.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(59,130,246,.06) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #c58a63, #a06a44)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                  fill="rgba(255,255,255,0.15)"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fffdf8', letterSpacing: -0.3 }}>
                Sahabat Halal
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#c58a63', letterSpacing: 1.4, textTransform: 'uppercase' }}>
                Web Administratif
              </div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255,253,248,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,253,248,0.1)',
            borderRadius: 24,
            padding: '36px 32px 32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#fffdf8',
              margin: '0 0 6px',
              letterSpacing: -0.3,
            }}
          >
            Masuk ke Dashboard
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,253,248,0.5)', margin: '0 0 28px' }}>
            Gunakan akun internal Sahabat Halal Anda.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,253,248,0.6)', marginBottom: 7, letterSpacing: 0.3 }}
              >
                Alamat Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@sahabathalal.id"
                autoComplete="email"
                style={{
                  width: '100%',
                  height: 46,
                  padding: '0 14px',
                  background: 'rgba(255,253,248,0.06)',
                  border: '1px solid rgba(255,253,248,0.12)',
                  borderRadius: 12,
                  color: '#fffdf8',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color .15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(197,138,99,0.6)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,253,248,0.12)')}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,253,248,0.6)', marginBottom: 7, letterSpacing: 0.3 }}
              >
                Kata Sandi
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: 46,
                    padding: '0 42px 0 14px',
                    background: 'rgba(255,253,248,0.06)',
                    border: '1px solid rgba(255,253,248,0.12)',
                    borderRadius: 12,
                    color: '#fffdf8',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color .15s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(197,138,99,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,253,248,0.12)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,253,248,0.4)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPass ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{
                  background: 'rgba(168,95,79,0.15)',
                  border: '1px solid rgba(168,95,79,0.3)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#e8a898',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              style={{
                height: 48,
                borderRadius: 14,
                border: 'none',
                background: isSubmitting
                  ? 'rgba(197,138,99,0.5)'
                  : 'linear-gradient(135deg, #c58a63, #a06a44)',
                color: '#fffdf8',
                fontFamily: 'inherit',
                fontSize: 14.5,
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'opacity .15s, transform .1s',
                marginTop: 4,
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {isSubmitting ? 'Memverifikasi…' : 'Masuk'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,253,248,0.28)', marginTop: 20 }}>
          Sahabat Halal — Sistem Informasi Halal v1.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
