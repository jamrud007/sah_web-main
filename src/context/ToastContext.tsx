// src/context/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextType {
  showToast: (message: string) => void;
  toastMessage: string | null;
  stateDemo: 'data' | 'kosong' | 'memuat' | 'galat';
  setStateDemo: (s: 'data' | 'kosong' | 'memuat' | 'galat') => void;
  lang: 'id' | 'en';
  setLang: (l: 'id' | 'en') => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  toastMessage: null,
  stateDemo: 'data',
  setStateDemo: () => {},
  lang: 'id',
  setLang: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stateDemo, setStateDemo] = useState<'data' | 'kosong' | 'memuat' | 'galat'>('data');
  const [lang, setLang] = useState<'id' | 'en'>('id');

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toastMessage, stateDemo, setStateDemo, lang, setLang }}>
      {children}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 26,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '13px 20px',
            borderRadius: 18,
            background: 'var(--sah-navy)',
            color: 'var(--sah-white)',
            boxShadow: 'var(--sah-shadow)',
            animation: 'rise .22s ease',
            maxWidth: 'min(560px, 90vw)',
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              background: 'var(--sah-copper)',
              display: 'grid',
              placeItems: 'center',
              flex: 'none',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--sah-white)" strokeWidth="2.6" strokeLinecap="round">
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useSahToast = () => useContext(ToastContext);
