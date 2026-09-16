// src/components/layout/SahLayout.tsx
// Exact 1:1 markup, styling, and navigation from SAH Web Admin (standalone).html

import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  logoutAsync,
  type SahRole,
  checkIsAllRole,
  getSahRole,
  getRoleDisplayName,
  checkIsReadOnly,
} from '../../store/authSlice';
import { useSahToast } from '../../context/ToastContext';
import {
  MODS,
  NAVORDER,
  SCREENS,
  GAPS,
  L,
  type ScreenDef,
} from '../../constants/sahNav';

interface SahLayoutProps {
  children: React.ReactNode;
}

const SahLayout: React.FC<SahLayoutProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userInfo = useAppSelector((s) => s.auth.userInfo);
  const { showToast, stateDemo, setStateDemo, lang, setLang } = useSahToast();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/login', { replace: true });
  };

  const handleGlobalSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = globalSearch.trim();
    if (q) {
      navigate(`/produk?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/produk');
    }
  };

  const isAllRole = checkIsAllRole(userInfo);
  const currentSahRole: SahRole = getSahRole(userInfo);
  const roleName = getRoleDisplayName(userInfo);
  const isReadOnly = checkIsReadOnly(userInfo);

  // Tampilkan nama & email asli dari backend, fallback ke role map jika null
  const meName = userInfo?.display_name || userInfo?.email?.split('@')[0] || 'Pengguna';
  const meEmail = userInfo?.email || '';
  const meInit = meName.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join('');

  const t = L[lang];
  const path = location.pathname;
  const currentScreen: ScreenDef =
    SCREENS.find((s) => s.h === path || (path === '/' && s.h === '/produk')) ||
    (path.startsWith('/produk/form') ? SCREENS[3] : null) ||
    (path.startsWith('/produk/foto') ? SCREENS[4] : null) ||
    (path.startsWith('/produk/detail') ? SCREENS[5] : null) ||
    (path.startsWith('/products/new') ? SCREENS[3] : null) ||
    (path.includes('/photos') ? SCREENS[4] : null) ||
    (path.startsWith('/products/') ? SCREENS[5] : null) ||
    (path === '/products' ? SCREENS[2] : SCREENS[2]);

  const currentMod = MODS[currentScreen.m] || MODS.katalog;
  const isTableScreen = currentScreen.v === 'table';

  const handleNotificationClick = () => {
    showToast(
      lang === 'id'
        ? 'Notifikasi: 2 SKU baru menunggu indeks visual.'
        : 'Notifications: 2 new SKUs awaiting visual index.'
    );
  };

  // Build navigation groups allowed for this role
  const navGroups = NAVORDER.map((k) => {
    const m = MODS[k];
    if (!isAllRole && !m.roles.includes(currentSahRole)) return null;
    const items = SCREENS.filter((x) => x.m === k && x.v !== 'login').map((x) => {
      const isItemActive =
        path === x.h ||
        (x.h === '/produk' && (path === '/products' || path === '/')) ||
        (x.h === '/produk/form' && (path === '/products/new' || path.startsWith('/produk/form'))) ||
        (x.h === '/produk/foto' && (path.includes('/photos') || path.startsWith('/produk/foto'))) ||
        (x.h === '/produk/detail' && path.startsWith('/produk/detail'));

      return {
        label: x[lang],
        href: x.h,
        icon: m.icon,
        num: x.c.replace('SCR-WEB-', ''),
        active: isItemActive,
      };
    });
    if (!items.length) return null;
    return { label: m[lang], items };
  }).filter(Boolean);

  const gapMessage = GAPS[currentScreen.h];

  const renderNavList = () => (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {navGroups.map((g, gi) => (
        <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            style={{
              padding: '0 10px 6px',
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: 'var(--sah-copper)',
            }}
          >
            {g?.label}
          </div>
          {g?.items.map((it, ii) => (
            <Link
              key={ii}
              to={it.href}
              onClick={() => setMobileDrawerOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 11px',
                borderRadius: 13,
                background: it.active ? 'rgba(197,138,99,.22)' : 'transparent',
                border: it.active ? '1px solid var(--sah-copper)' : '1px solid transparent',
                color: it.active ? 'var(--sah-white)' : 'rgba(255,253,248,.76)',
                fontSize: 13,
                fontWeight: it.active ? 600 : 400,
                textDecoration: 'none',
                transition: 'all .15s ease',
              }}
              onMouseEnter={(e) => {
                if (!it.active) e.currentTarget.style.background = 'rgba(255,253,248,.07)';
              }}
              onMouseLeave={(e) => {
                if (!it.active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flex: 'none', opacity: 0.9 }}
              >
                <path d={it.icon} />
              </svg>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {it.label}
              </span>
              <span style={{ fontSize: 9, letterSpacing: 0.5, color: 'rgba(255,253,248,.4)' }}>
                {it.num}
              </span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );

  const renderUserFooter = () => (
    <div
      style={{
        padding: '14px 16px',
        borderTop: '1px solid rgba(255,253,248,.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          background: 'var(--sah-blue)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 12.5,
          color: 'var(--sah-white)',
          flex: 'none',
        }}
      >
        {meInit}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--sah-white)',
          }}
        >
          {meName}
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: 'rgba(255,253,248,.55)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {meEmail || roleName}
        </div>
      </div>
      <button
        title="Keluar"
        onClick={handleLogout}
        style={{
          background: 'none',
          border: 0,
          color: 'rgba(255,253,248,.6)',
          padding: 0,
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M15 17l5-5-5-5M20 12H9M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
        </svg>
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--sah-ivory)', position: 'relative' }}>
      {/* ── MOBILE DRAWER BACKDROP ───────────────────────────── */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(14, 22, 36, 0.65)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 90,
          }}
        />
      )}

      {/* ── MOBILE OFF-CANVAS DRAWER ─────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: 260,
          background: 'var(--sah-navy)',
          color: 'var(--sah-white)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          boxShadow: mobileDrawerOpen ? '0 0 30px rgba(0,0,0,0.5)' : 'none',
          transform: mobileDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: mobileDrawerOpen ? 'auto' : 'none',
          visibility: mobileDrawerOpen ? 'visible' : 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 18px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,253,248,.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: 'var(--sah-copper)',
                display: 'grid',
                placeItems: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 13.5,
                color: 'var(--sah-white)',
              }}
            >
              SH
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 14.5,
                  letterSpacing: -0.2,
                  color: 'var(--sah-white)',
                }}
              >
                Sahabat Halal
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,253,248,.55)', letterSpacing: 0.4 }}>
                Web Administratif
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            title="Tutup Menu"
            style={{
              background: 'rgba(255,253,248,.1)',
              border: 0,
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--sah-white)',
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {renderNavList()}
        {renderUserFooter()}
      </div>

      {/* ── DESKTOP STICKY SIDEBAR ──────────────────────────── */}
      <aside
        className="sah-sidebar-desktop"
        style={{
          width: 248,
          flex: 'none',
          background: 'var(--sah-navy)',
          color: 'var(--sah-white)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '22px 20px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            borderBottom: '1px solid rgba(255,253,248,.1)',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: 'var(--sah-copper)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 13.5,
              color: 'var(--sah-white)',
              flex: 'none',
            }}
          >
            SH
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 14.5,
                letterSpacing: -0.2,
                color: 'var(--sah-white)',
              }}
            >
              Sahabat Halal
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,253,248,.55)', letterSpacing: 0.4 }}>
              Web Administratif
            </div>
          </div>
        </div>

        {renderNavList()}
        {renderUserFooter()}
      </aside>

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Sticky Topbar */}
        <header
          style={{
            height: 64,
            flex: 'none',
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: 'var(--sah-glass)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderBottom: '1px solid var(--sah-line)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '0 24px',
          }}
        >
          {/* Mobile / Tablet Hamburger Toggle */}
          <button
            type="button"
            className="sah-hamburger-btn"
            onClick={() => setMobileDrawerOpen(true)}
            title="Buka Menu Navigasi"
            style={{
              width: 38,
              height: 38,
              border: '1px solid var(--sah-line)',
              borderRadius: 14,
              background: 'var(--sah-white)',
              placeItems: 'center',
              cursor: 'pointer',
              flex: 'none',
              color: 'var(--sah-navy)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10.5, color: 'var(--sah-muted)', letterSpacing: 0.3 }}>
              Sahabat Halal · {currentMod[lang]} · {currentScreen.c}
            </div>
            <div
              className="sah-topbar-title"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 16.5,
                letterSpacing: -0.35,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'var(--sah-navy)',
              }}
            >
              {currentScreen[lang]}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Search bar (BUG-12) */}
          <form
            onSubmit={handleGlobalSearch}
            className="sah-topbar-search"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 38,
              padding: '0 14px',
              border: '1px solid var(--sah-line)',
              borderRadius: 14,
              background: 'var(--sah-white)',
              width: 236,
              margin: 0,
            }}
          >
            <button
              type="submit"
              title="Cari"
              style={{
                background: 'none',
                border: 0,
                padding: 0,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                color: 'var(--sah-muted)',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16M21 21l-4.3-4.3" />
              </svg>
            </button>
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={t.search}
              style={{
                border: 0,
                background: 'none',
                outline: 'none',
                width: '100%',
                fontSize: 13,
                color: 'var(--sah-navy)',
              }}
            />
          </form>

          {/* Notification Button */}
          <button
            title="Notifikasi"
            onClick={handleNotificationClick}
            style={{
              position: 'relative',
              width: 38,
              height: 38,
              border: '1px solid var(--sah-line)',
              borderRadius: 14,
              background: 'var(--sah-white)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--sah-navy)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            <span
              style={{
                position: 'absolute',
                top: 8,
                right: 9,
                width: 7,
                height: 7,
                borderRadius: 999,
                background: 'var(--sah-copper)',
              }}
            />
          </button>

          {/* Role Badge (real role dari backend) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              height: 38,
              padding: '0 12px',
              border: '1px solid var(--sah-line)',
              borderRadius: 14,
              background: 'var(--sah-white)',
            }}
          >
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'var(--sah-copper)',
              }}
            >
              {t.roleLbl}
            </span>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--sah-navy)',
              }}
            >
              {roleName}
            </span>
          </div>

          {/* Language Toggle */}
          <div
            style={{
              display: 'flex',
              border: '1px solid var(--sah-line)',
              borderRadius: 14,
              overflow: 'hidden',
              background: 'var(--sah-white)',
            }}
          >
            <button
              onClick={() => setLang('id')}
              style={{
                padding: '0 12px',
                height: 38,
                border: 0,
                background: lang === 'id' ? 'var(--sah-navy)' : 'transparent',
                color: lang === 'id' ? 'var(--sah-white)' : 'var(--sah-muted)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ID
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                padding: '0 12px',
                height: 38,
                border: 0,
                borderLeft: '1px solid var(--sah-line)',
                background: lang === 'en' ? 'var(--sah-navy)' : 'transparent',
                color: lang === 'en' ? 'var(--sah-white)' : 'var(--sah-muted)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              EN
            </button>
          </div>
        </header>

        {/* Content Page Canvas */}
        <main style={{ flex: 1, padding: '28px 28px 64px' }}>
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Page Header Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: 1.8,
                    textTransform: 'uppercase',
                    color: 'var(--sah-copper)',
                  }}
                >
                  {currentMod[lang]}
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 27,
                    letterSpacing: -0.8,
                    marginTop: 4,
                    color: 'var(--sah-navy)',
                  }}
                >
                  {currentScreen[lang]}
                </div>
                <div style={{ fontSize: 13, color: 'var(--sah-muted)', marginTop: 3 }}>
                  {currentScreen.p}
                </div>
              </div>

              {/* State Demo Switcher (Data | Kosong | Memuat | Galat) on Table screens */}
              {isTableScreen && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10.5, color: 'var(--sah-muted)' }}>{t.stateDemo}</span>
                  <div
                    style={{
                      display: 'flex',
                      border: '1px solid var(--sah-line)',
                      borderRadius: 999,
                      overflow: 'hidden',
                      background: 'var(--sah-white)',
                    }}
                  >
                    {(
                      [
                        ['data', t.stD],
                        ['kosong', t.stK],
                        ['memuat', t.stL],
                        ['galat', t.stG],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setStateDemo(val)}
                        style={{
                          padding: '7px 13px',
                          border: 0,
                          background: stateDemo === val ? 'var(--sah-navy)' : 'transparent',
                          color: stateDemo === val ? 'var(--sah-white)' : 'var(--sah-muted)',
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all .12s ease',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Screen Code Pill */}
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: 'var(--sah-muted)',
                  border: '1px solid var(--sah-line)',
                  borderRadius: 999,
                  padding: '6px 12px',
                  background: 'var(--sah-white)',
                }}
              >
                {currentScreen.c}
              </div>
            </div>

            {/* Read-Only Warning Banner */}
            {isReadOnly && currentScreen.v !== 'home' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 16px',
                  border: '1px solid var(--sah-line)',
                  borderRadius: 16,
                  background: 'var(--sah-mist-soft)',
                }}
              >
                <span style={{ color: 'var(--sah-blue-strong)', fontSize: 10 }}>●</span>
                <div style={{ fontSize: 12.5, color: 'var(--sah-frame)' }}>
                  {lang === 'id'
                    ? `Peran ${currentSahRole} hanya memiliki hak baca pada modul ini (§3.3). Aksi pengubahan dinonaktifkan.`
                    : `Role ${currentSahRole} has read-only access to this module (§3.3). Editing actions are disabled.`}
                </div>
              </div>
            )}

            {/* Gap PRD Note Banner */}
            {gapMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '11px 16px',
                  border: '1px dashed var(--sah-copper)',
                  borderRadius: 16,
                  background: 'var(--sah-copper-pale)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontWeight: 600,
                    fontSize: 17,
                    color: 'var(--sah-copper-dark)',
                    lineHeight: 1.2,
                  }}
                >
                  §
                </span>
                <div style={{ fontSize: 12.5, color: 'var(--sah-frame)' }}>{gapMessage}</div>
              </div>
            )}

            {/* Page Content Body */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SahLayout;
