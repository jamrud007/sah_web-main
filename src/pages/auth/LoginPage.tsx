// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginAsync, setDevBypassSession } from '../../store/authSlice';

const PRESET_ACCOUNTS = [
  { email: 'catalog@sah.id', pass: 'halotec123', label: 'Admin Katalog', badge: 'content_manager' },
  { email: 'su@sah.id', pass: 'halotec123', label: 'Super User', badge: 'allrole' },
  { email: 'admin@sah.id', pass: 'halotec123', label: 'Admin Sistem', badge: 'system_admin' },
];

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector((s) => s.auth.isLoading);
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [email, setEmail] = useState('catalog@sah.id');
  const [password, setPassword] = useState('halotec123');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In dev mode (unless user explicitly opens /login?switch=1), auto-navigate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceLoginView = params.get('switch') === '1' || params.get('mode') === 'login';

    const isStrict =
      import.meta.env.MODE === 'production' ||
      import.meta.env.VITE_AUTH_MODE === 'production' ||
      localStorage.getItem('auth_mode') === 'production';

    if (!isStrict && !forceLoginView) {
      navigate('/produk', { replace: true });
      return;
    }

    if (isAuthenticated && accessToken && !accessToken.startsWith('test-token-')) {
      navigate('/produk', { replace: true });
    }
  }, [isAuthenticated, accessToken, navigate]);

  const handleSubmit = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (customEmail || email).trim();
    const targetPass = customPass || password;

    if (!targetEmail || !targetPass) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const result = await dispatch(loginAsync({ email: targetEmail, password: targetPass }));
      if (loginAsync.fulfilled.match(result)) {
        localStorage.setItem('auth_mode', 'production');
        navigate('/produk', { replace: true });
      } else {
        setError((result.payload as string) || 'Login gagal.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevBypass = () => {
    localStorage.setItem('auth_mode', 'dev');
    dispatch(setDevBypassSession());
    navigate('/produk', { replace: true });
  };

  const handleSelectPreset = (pEmail: string, pPass: string) => {
    setEmail(pEmail);
    setPassword(pPass);
    handleSubmit(undefined, pEmail, pPass);
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

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
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
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #c58a63, #a06a44)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 20px rgba(197,138,99,0.35)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fffdf8', letterSpacing: -0.3 }}>
                Sahabat Halal
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c58a63', letterSpacing: 1.4, textTransform: 'uppercase' }}>
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
            padding: '34px 30px 30px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h1
              style={{
                fontSize: 21,
                fontWeight: 800,
                color: '#fffdf8',
                margin: 0,
                letterSpacing: -0.3,
              }}
            >
              Masuk ke Dashboard
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(39, 110, 144, 0.25)',
                color: '#7bc1e0',
                padding: '3px 8px',
                borderRadius: 8,
                border: '1px solid rgba(39, 110, 144, 0.4)',
              }}
            >
              API-013 Real JWT
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,253,248,0.55)', margin: '0 0 20px', lineHeight: 1.45 }}>
            Masuk dengan akun internal untuk mendapatkan <strong>Akses Token Riil</strong> dari service backend.
          </p>

          {/* Quick Account Preset Chips */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,253,248,0.45)', marginBottom: 8 }}>
              Pilih Akun Cepat:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_ACCOUNTS.map((p) => {
                const isActive = email === p.email;
                return (
                  <button
                    key={p.email}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSelectPreset(p.email, p.pass)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 10,
                      border: isActive
                        ? '1px solid #c58a63'
                        : '1px solid rgba(255,253,248,0.12)',
                      background: isActive
                        ? 'rgba(197,138,99,0.2)'
                        : 'rgba(255,253,248,0.05)',
                      color: isActive ? '#fffdf8' : 'rgba(255,253,248,0.75)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all .15s ease',
                    }}
                  >
                    <span>{p.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.65, fontFamily: 'monospace' }}>({p.email.split('@')[0]})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,253,248,0.7)', marginBottom: 6, letterSpacing: 0.3 }}
              >
                Alamat Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="catalog@sah.id"
                autoComplete="email"
                style={{
                  width: '100%',
                  height: 46,
                  padding: '0 14px',
                  background: 'rgba(255,253,248,0.06)',
                  border: '1px solid rgba(255,253,248,0.15)',
                  borderRadius: 12,
                  color: '#fffdf8',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color .15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(197,138,99,0.7)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,253,248,0.15)')}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,253,248,0.7)', marginBottom: 6, letterSpacing: 0.3 }}
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
                    border: '1px solid rgba(255,253,248,0.15)',
                    borderRadius: 12,
                    color: '#fffdf8',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color .15s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(197,138,99,0.7)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,253,248,0.15)')}
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
                    color: 'rgba(255,253,248,0.5)',
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
                  background: 'rgba(168,95,79,0.2)',
                  border: '1px solid rgba(168,95,79,0.4)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#fca5a5',
                  lineHeight: 1.4,
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
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                  <span>Mengautentikasi Token Riil…</span>
                </>
              ) : (
                <>
                  <span>Masuk (Dapatkan Token Riil) →</span>
                </>
              )}
            </button>

            {/* Dev Mode Direct Bypass Button */}
            <button
              type="button"
              onClick={handleDevBypass}
              style={{
                height: 44,
                borderRadius: 14,
                border: '1px solid rgba(197,138,99,0.35)',
                background: 'rgba(255,253,248,0.06)',
                color: '#c58a63',
                fontFamily: 'inherit',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all .15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(197,138,99,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,253,248,0.06)'; }}
            >
              <span>⚡ Masuk Mode Dev (Bypass Login Langsung) →</span>
            </button>

            {/* Backend Info Note */}
            <div
              style={{
                background: 'rgba(255,253,248,0.03)',
                border: '1px solid rgba(255,253,248,0.08)',
                borderRadius: 12,
                padding: '10px 12px',
                fontSize: 11.5,
                color: 'rgba(255,253,248,0.5)',
                lineHeight: 1.4,
                textAlign: 'center',
              }}
            >
              Backend Service: <code style={{ color: '#c58a63' }}>http://47.237.223.240:8010/be/api/v1</code>
            </div>
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
