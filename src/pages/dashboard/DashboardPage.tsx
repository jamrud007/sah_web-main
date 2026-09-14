// src/pages/dashboard/DashboardPage.tsx
// Exact 1:1 SCR-WEB-02 (Beranda Admin) from SAH Web Admin (standalone).html

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { useSahToast } from '../../context/ToastContext';
import { I } from '../../constants/sahNav';
import { ROLE_USER_MAP, type SahRole } from '../../store/authSlice';

const DashboardPage: React.FC = () => {
  const userInfo = useAppSelector((s) => s.auth.userInfo);
  const products = useAppSelector((s) => s.products.items);
  const { lang } = useSahToast();

  const currentSahRole: SahRole =
    userInfo?.role === 'administrator'
      ? 'US-04'
      : (userInfo?.email?.includes('lestari') ? 'US-05' : 'US-02');

  const me = ROLE_USER_MAP[currentSahRole] || ROLE_USER_MAP['US-02'];
  const firstName = me.name.split(' ')[0];

  const kpiRole = {
    'US-02': [
      { v: String(products.length || '1.284'), l: 'SKU aktif di katalog' },
      { v: '146', l: 'Materi konten' },
      { v: '37', l: 'Antrean kurasi & laporan' },
    ],
    'US-04': [
      { v: '14', l: 'Akun internal aktif' },
      { v: '23', l: 'Klaim menunggu keputusan' },
      { v: '5', l: 'Permintaan hapus akun' },
    ],
    'US-05': [
      { v: '92.417', l: 'Sesi pemindaian 30 hari' },
      { v: '0,84', l: 'Skor kemiripan rata-rata' },
      { v: '8', l: 'Produk di bawah ambang mutu' },
    ],
  }[currentSahRole];

  const queues = [
    {
      tag: 'Katalog produk',
      code: 'SCR-WEB-03',
      n: '6',
      t: 'SKU menunggu indeks',
      d: '2 SKU galat ekstraksi fitur visual.',
      pct: '22%',
      bar: 'var(--sah-copper)',
      meta: 'Penambahan SKU tanpa pelatihan ulang model (AR-01).',
      href: '/produk',
      roles: ['US-02', 'US-04', 'US-05'],
    },
  ].filter((q) => q.roles.includes(currentSahRole));

  const shortcuts: Array<{ label: string; code: string; href: string; icon: string }> = [
    { label: 'Daftar Produk', code: 'SCR-WEB-03', href: '/produk', icon: I.box },
    { label: 'Form SKU', code: 'SCR-WEB-04', href: '/produk/form', icon: I.box },
    { label: 'Foto Referensi & Editor', code: 'SCR-WEB-05', href: '/produk/foto', icon: I.box },
    { label: 'Detail Produk', code: 'SCR-WEB-06', href: '/produk/detail', icon: I.box },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Gradient Hero Operational Banner */}
      <div
        style={{
          borderRadius: 25,
          padding: '26px 28px',
          background: 'linear-gradient(145deg,#477fa2,#25384a 58%,#6f3f32)',
          color: 'var(--sah-white)',
          boxShadow: 'var(--sah-shadow)',
          display: 'flex',
          gap: 28,
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: 'var(--sah-copper-pale)',
            }}
          >
            {lang === 'id' ? 'Antrean hari ini · 12 April 2026' : "Today's queues · 12 April 2026"}
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: -0.7,
              marginTop: 6,
            }}
          >
            {lang === 'id' ? `Selamat pagi, ${firstName}.` : `Good morning, ${firstName}.`}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,253,248,.78)', marginTop: 4, maxWidth: 440 }}>
            {lang === 'id'
              ? `Menu dan antrean di bawah menyesuaikan peran ${currentSahRole} sesuai matriks hak akses PRD §3.3.`
              : `Menus and queues below follow the ${currentSahRole} role per the PRD §3.3 access matrix.`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap' }}>
          {kpiRole.map((k, idx) => (
            <div key={idx}>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 34,
                  letterSpacing: -1.2,
                  lineHeight: 1,
                }}
              >
                {k.v}
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,253,248,.72)', marginTop: 4 }}>
                {k.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queues Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(268px, 1fr))', gap: 16 }}>
        {queues.map((q, idx) => (
          <Link
            key={idx}
            to={q.href}
            style={{
              background: 'var(--sah-white)',
              border: '1px solid var(--sah-line)',
              borderRadius: 22,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              color: 'var(--sah-navy)',
              textDecoration: 'none',
              transition: 'border-color .15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sah-copper)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sah-line)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  color: 'var(--sah-copper)',
                }}
              >
                {q.tag}
              </span>
              <span style={{ fontSize: 10, letterSpacing: 1, color: 'var(--sah-muted)' }}>{q.code}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 30,
                  letterSpacing: -1,
                }}
              >
                {q.n}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{q.t}</span>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--sah-muted)' }}>{q.d}</div>

            <div
              style={{
                height: 5,
                borderRadius: 999,
                background: 'var(--sah-mist-soft)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '100%', width: q.pct, background: q.bar }} />
            </div>

            <div style={{ fontSize: 11.5, color: 'var(--sah-frame)' }}>{q.meta}</div>
          </Link>
        ))}
      </div>

      {/* Module Shortcuts */}
      <div
        style={{
          background: 'var(--sah-white)',
          border: '1px solid var(--sah-line)',
          borderRadius: 22,
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>
            {lang === 'id' ? 'Pintasan modul' : 'Module shortcuts'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--sah-muted)' }}>
            {shortcuts.length} layar dapat diakses peran ini
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(196px, 1fr))', gap: 10 }}>
          {shortcuts.map((s, idx) => (
            <Link
              key={idx}
              to={s.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '13px 14px',
                border: '1px solid var(--sah-line)',
                borderRadius: 16,
                background: 'var(--sah-ivory)',
                color: 'var(--sah-navy)',
                textDecoration: 'none',
                transition: 'background .15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sah-copper-pale)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--sah-ivory)')}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--sah-copper-dark)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flex: 'none' }}
              >
                <path d={s.icon} />
              </svg>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 10, letterSpacing: 0.8, color: 'var(--sah-muted)' }}>{s.code}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
