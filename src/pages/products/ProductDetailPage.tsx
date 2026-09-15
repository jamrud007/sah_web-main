// src/pages/products/ProductDetailPage.tsx
// Exact 1:1 SCR-WEB-06 (Detail Produk) from SAH Web Admin (standalone).html

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteProduct, fetchProductById } from '../../store/productSlice';
import { useSahToast } from '../../context/ToastContext';
import type { Product, Photo } from '../../types/apiDef';
import { checkIsReadOnly } from '../../store/authSlice';

const DEFAULT_ANGLES = [
  { angle: 'Depan', key: 'depan' },
  { angle: 'Belakang', key: 'belakang' },
  { angle: 'Sisi kiri', key: 'sisi_kiri' },
  { angle: 'Sisi kanan', key: 'sisi_kanan' },
  { angle: 'Tutup', key: 'tutup' },
  { angle: 'Kemasan isi ulang', key: 'kemasan_isi_ulang' },
];

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { showToast, lang } = useSahToast();

  const userInfo = useAppSelector((s) => s.auth.userInfo);
  const isReadOnly = checkIsReadOnly(userInfo);

  const products = useAppSelector((s) => s.products.items);
  const photosByProductId = useAppSelector((s) => s.products.photosByProductId);

  useEffect(() => {
    if (id && !products.some((p) => p.id === id || p.sku_code === id)) {
      dispatch(fetchProductById(id));
    }
  }, [id, products, dispatch]);

  // Find product by id or sku_code, or fallback to first
  const product: Product | undefined =
    products.find((p: Product) => p.id === id || p.sku_code === id) || products[0];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search combobox state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  if (!product) {
    return (
      <div
        style={{
          padding: '64px 32px',
          textAlign: 'center',
          background: 'var(--sah-white)',
          borderRadius: 24,
          border: '1px solid var(--sah-line)',
        }}
      >
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 18 }}>
          {lang === 'id' ? 'Produk Tidak Ditemukan' : 'Product Not Found'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--sah-muted)', marginTop: 6 }}>
          {lang === 'id' ? 'SKU yang diminta tidak terdaftar pada katalog.' : 'The requested SKU is not registered.'}
        </div>
        <button
          onClick={() => navigate('/produk')}
          style={{
            marginTop: 16,
            height: 40,
            padding: '0 20px',
            borderRadius: 14,
            background: 'var(--sah-copper)',
            color: 'var(--sah-white)',
            border: 0,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {lang === 'id' ? '← Kembali ke Daftar Produk' : '← Back to Product List'}
        </button>
      </div>
    );
  }

  // Determine initial letters for monogram fallback
  const initialLetters = product.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'SK';

  // Format last updated date
  const rawDate = product.updated_at || product.created_at || '2026-01-12T00:00:00Z';
  let formattedDate = '12 Januari 2026';
  try {
    formattedDate = new Date(rawDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    formattedDate = '12 Januari 2026';
  }

  // Merge photos from product object and photosByProductId
  const attachedPhotos: Photo[] =
    (product.photos && product.photos.length > 0)
      ? product.photos
      : (photosByProductId[product.id] || []);

  // Resolve certificate — API returns array (halal_certificates), mock uses singular (halal_certificate)
  const activeCert = product.halal_certificates?.[0] ?? product.halal_certificate ?? null;

  const primaryPhoto = attachedPhotos.find((p) => p.is_primary) || attachedPhotos[0];

  // Gallery items for the 6 standard angles
  const galleryItems = DEFAULT_ANGLES.map((std) => {
    const matchedPhoto = attachedPhotos.find(
      (p) =>
        (p.angle && p.angle.toLowerCase() === std.angle.toLowerCase()) ||
        (p.package_side && p.package_side.toLowerCase() === std.key)
    );
    return {
      angle: std.angle,
      key: std.key,
      photo: matchedPhoto,
    };
  });

  const indexedCount = attachedPhotos.length > 0 ? attachedPhotos.length : 4;
  const totalAngles = 6;

  // Metadata grid items
  const metadataItems = [
    { k: 'Kategori', v: product.category || 'Bumbu & saus' },
    {
      k: 'Nomor sertifikat',
      v: activeCert?.certificate_no || '—',
    },
    {
      k: 'Penerbit',
      v: activeCert?.issuer || '—',
    },
    {
      k: 'Tanggal terbit',
      v: activeCert?.issued_date
        ? new Date(activeCert.issued_date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '—',
    },
    {
      k: 'Masa berlaku',
      v: activeCert?.valid_until
        ? new Date(activeCert.valid_until).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '—',
    },
    {
      k: 'Status halal',
      v:
        product.halal_status === 'halal'
          ? 'Halal terverifikasi'
          : product.halal_status === 'pending'
          ? 'Menunggu pembaruan'
          : 'Tidak bersertifikat',
    },
    {
      k: 'Status indeks visual',
      v: `${indexedCount} dari ${totalAngles} foto terindeks`,
    },
    {
      k: 'Terakhir diubah',
      v: `${formattedDate} · Rizky Ananda`,
    },
  ];

  const handleDelete = async () => {
    if (isReadOnly) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(product.id)).unwrap();
      showToast(
        lang === 'id'
          ? `SKU ${product.sku_code} berhasil dihapus. Vektor fitur dicabut.`
          : `SKU ${product.sku_code} deleted.`
      );
      navigate('/produk');
    } catch {
      showToast(lang === 'id' ? 'Gagal menghapus SKU.' : 'Failed to delete SKU.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ── PRODUCT SELECTOR BAR ─────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--sah-white)',
          border: '1px solid var(--sah-line)',
          borderRadius: 20,
          padding: '14px 20px',
          boxShadow: 'var(--sah-shadow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'var(--sah-copper-pale)',
                color: 'var(--sah-frame)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 15,
              }}
            >
              📦
            </span>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--sah-navy)',
              }}
            >
              {lang === 'id' ? 'Pilih Produk / SKU:' : 'Select Product / SKU:'}
            </span>
          </div>

          <div ref={searchRef} style={{ position: 'relative', minWidth: 320 }}>
            {/* Search icon */}
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--sah-muted)',
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder={lang === 'id' ? 'Cari nama produk atau SKU…' : 'Search product name or SKU…'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 12,
                border: '1px solid var(--sah-line)',
                background: 'var(--sah-ivory)',
                padding: '0 14px 0 36px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--sah-navy)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {showSuggestions && (() => {
              const q = searchQuery.toLowerCase();
              const filtered = products.filter(
                (p) =>
                  !q ||
                  p.name.toLowerCase().includes(q) ||
                  p.sku_code.toLowerCase().includes(q) ||
                  (p.manufacturer || '').toLowerCase().includes(q)
              );
              return filtered.length > 0 ? (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: 'var(--sah-white)',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    boxShadow: '0 8px 32px rgba(23,36,58,.14)',
                    zIndex: 100,
                    maxHeight: 260,
                    overflowY: 'auto',
                    padding: '6px 0',
                  }}
                >
                  {filtered.map((p) => (
                    <button
                      key={p.id || p.sku_code}
                      onMouseDown={() => {
                        navigate(`/produk/detail/${p.id || p.sku_code}`);
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        padding: '9px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: 2,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--sah-ivory)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'none';
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sah-navy)' }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--sah-muted)' }}>
                        {p.sku_code}{p.manufacturer ? ` · ${p.manufacturer}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--sah-navy)',
              background: 'var(--sah-mist-soft)',
              padding: '6px 14px',
              borderRadius: 999,
            }}
          >
            {product.name} · {product.sku_code}
          </span>
          <Link
            to={`/produk/foto/${product.id}`}
            style={{
              height: 34,
              padding: '0 14px',
              borderRadius: 10,
              border: '1px solid var(--sah-copper)',
              background: 'var(--sah-copper-pale)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--sah-frame)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {lang === 'id' ? 'Foto & Editor ↗' : 'Photos & Editor ↗'}
          </Link>
        </div>
      </div>

      {/* 2-Column Detail Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 300px',
          gap: 20,
          alignItems: 'start',
        }}
      >
      {/* ── LEFT COLUMN ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Main Product Header Card */}
        <div
          style={{
            background: 'var(--sah-white)',
            border: '1px solid var(--sah-line)',
            borderRadius: 24,
            boxShadow: 'var(--sah-shadow)',
            padding: '24px 26px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Header Row with Monogram/Photo & SKU Title */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 22,
                background: primaryPhoto?.url
                  ? `url(${primaryPhoto.url}) center / cover no-repeat`
                  : 'linear-gradient(145deg,#24384e,#182436 60%,#4a2c22)',
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
                boxShadow: '0 4px 14px rgba(23,36,58,.1)',
                overflow: 'hidden',
              }}
            >
              {!primaryPhoto?.url && (
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 28,
                    color: 'rgba(255,253,248,.95)',
                    letterSpacing: -0.5,
                  }}
                >
                  {initialLetters}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  color: 'var(--sah-copper)',
                }}
              >
                {product.sku_code}
              </div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 23,
                  letterSpacing: -0.6,
                  marginTop: 4,
                  color: 'var(--sah-navy)',
                }}
              >
                {product.name}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: 'var(--sah-muted)',
                  marginTop: 2,
                  fontWeight: 500,
                }}
              >
                {product.manufacturer}
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--sah-line)' }} />

          {/* Metadata Grid (3 columns) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '16px 20px',
            }}
          >
            {metadataItems.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: 'var(--sah-muted)',
                  }}
                >
                  {m.k}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: 'var(--sah-navy)',
                    lineHeight: 1.35,
                  }}
                >
                  {m.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reference Photos Gallery Card */}
        <div
          style={{
            background: 'var(--sah-white)',
            border: '1px solid var(--sah-line)',
            borderRadius: 24,
            boxShadow: 'var(--sah-shadow)',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 15.5,
                color: 'var(--sah-navy)',
              }}
            >
              Galeri foto referensi
            </div>
            <Link
              to={`/produk/foto/${product.id}`}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--sah-copper-dark)',
                textDecoration: 'none',
              }}
            >
              Kelola foto →
            </Link>
          </div>

          {/* Grid of 5/6 angle cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {galleryItems.map((item, idx) => {
              const hasCustomPhoto = Boolean(item.photo?.url);
              const photoBg = hasCustomPhoto
                ? `url(${item.photo?.url}) center / cover no-repeat`
                : (idx % 3 === 0
                  ? 'linear-gradient(145deg,#22374d,#182536 60%,#462b20)'
                  : (idx % 3 === 1
                    ? 'linear-gradient(130deg,#9e5b38,#693922 60%,#182536)'
                    : 'linear-gradient(145deg,#2e455b,#1f2f42 60%,#874b2f)'));

              return (
                <div
                  key={idx}
                  style={{
                    border: item.photo?.is_primary
                      ? '1.5px solid var(--sah-copper)'
                      : '1px solid var(--sah-line)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: 'var(--sah-white)',
                    boxShadow: item.photo?.is_primary
                      ? '0 2px 8px rgba(197,138,99,.2)'
                      : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      height: 92,
                      background: photoBg,
                      display: 'grid',
                      placeItems: 'center',
                      position: 'relative',
                    }}
                  >
                    {!hasCustomPhoto && (
                      <span
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800,
                          fontSize: 22,
                          color: 'rgba(255,253,248,.92)',
                        }}
                      >
                        {initialLetters}
                      </span>
                    )}
                    {item.photo?.is_primary && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          padding: '2px 6px',
                          borderRadius: 999,
                          background: 'var(--sah-copper)',
                          color: 'var(--sah-white)',
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        ★ Utama
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      padding: '8px 10px',
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--sah-navy)',
                      background: 'var(--sah-white)',
                      borderTop: '1px solid var(--sah-line)',
                      textAlign: 'left',
                    }}
                  >
                    {item.angle}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: ACTIONS & ANALYTICS ────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 88,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Actions Card */}
        <div
          style={{
            background: 'var(--sah-white)',
            border: '1px solid var(--sah-line)',
            borderRadius: 24,
            boxShadow: 'var(--sah-shadow)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 11,
          }}
        >
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 14.5,
              color: 'var(--sah-navy)',
            }}
          >
            Tindakan
          </div>

          {/* Button 1: Sunting SKU */}
          <Link
            to={isReadOnly ? '#' : `/produk/form/${product.id}`}
            onClick={(e) => {
              if (isReadOnly) {
                e.preventDefault();
                showToast(
                  lang === 'id'
                    ? 'Peran US-04 hanya memiliki hak baca. Aksi pengubahan dinonaktifkan.'
                    : 'Role US-04 is read-only.'
                );
              }
            }}
            style={{
              height: 44,
              borderRadius: 15,
              background: isReadOnly ? 'rgba(197,138,99,.4)' : 'var(--sah-copper)',
              color: 'var(--sah-white)',
              fontWeight: 700,
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textDecoration: 'none',
              cursor: isReadOnly ? 'not-allowed' : 'pointer',
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isReadOnly) e.currentTarget.style.background = 'var(--sah-copper-pressed)';
            }}
            onMouseLeave={(e) => {
              if (!isReadOnly) e.currentTarget.style.background = 'var(--sah-copper)';
            }}
          >
            <span>Sunting SKU</span>
            <span>→</span>
          </Link>

          {/* Button 2: Foto referensi & editor */}
          <Link
            to={`/produk/foto/${product.id}`}
            style={{
              height: 42,
              border: '1px solid var(--sah-line)',
              borderRadius: 15,
              background: 'var(--sah-white)',
              color: 'var(--sah-navy)',
              fontWeight: 600,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              textDecoration: 'none',
              transition: 'border-color .15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sah-copper)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sah-line)')}
          >
            Foto referensi &amp; editor
          </Link>

          {/* Button 3: Hapus SKU */}
          <button
            type="button"
            disabled={isReadOnly}
            onClick={() => {
              if (isReadOnly) {
                showToast(
                  lang === 'id'
                    ? 'Peran US-04 hanya memiliki hak baca.'
                    : 'Role US-04 is read-only.'
                );
                return;
              }
              setShowDeleteModal(true);
            }}
            style={{
              height: 42,
              border: '1px solid var(--sah-line)',
              borderRadius: 15,
              background: isReadOnly ? 'rgba(23,36,58,.04)' : 'rgba(168,95,79,.08)',
              color: isReadOnly ? 'var(--sah-muted)' : 'var(--danger)',
              fontWeight: 600,
              fontSize: 13,
              textAlign: 'left',
              padding: '0 16px',
              cursor: isReadOnly ? 'not-allowed' : 'pointer',
              transition: 'all .15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isReadOnly) e.currentTarget.style.borderColor = 'var(--danger)';
            }}
            onMouseLeave={(e) => {
              if (!isReadOnly) e.currentTarget.style.borderColor = 'var(--sah-line)';
            }}
          >
            Hapus SKU — perlu konfirmasi
          </button>

          <div style={{ fontSize: 11.5, color: 'var(--sah-muted)', lineHeight: 1.4 }}>
            Penghapusan meminta konfirmasi dan mencabut vektor fitur terkait (FR-CAT-05, -10).
          </div>
        </div>

        {/* Analytics Card with Warm Gradient */}
        <div
          style={{
            background: 'linear-gradient(145deg, #c58a63 0%, #8c4c2d 58%, #522718 100%)',
            borderRadius: 24,
            padding: 22,
            color: 'var(--sah-white)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 12px 32px rgba(140,76,45,.28)',
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: 'rgba(255,253,248,.8)',
            }}
          >
            Rujukan analitik
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 28,
                letterSpacing: -0.8,
                lineHeight: 1.1,
              }}
            >
              6.980
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,253,248,.78)', marginTop: 2 }}>
              Sesi eksposur 30 hari
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 28,
                letterSpacing: -0.8,
                lineHeight: 1.1,
              }}
            >
              0,93
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,253,248,.78)', marginTop: 2 }}>
              Skor kemiripan rata-rata
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 28,
                letterSpacing: -0.8,
                lineHeight: 1.1,
              }}
            >
              12
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,253,248,.78)', marginTop: 2 }}>
              Kueri gagal
            </div>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────── */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(23,36,58,.45)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'var(--sah-white)',
              borderRadius: 24,
              border: '1px solid var(--sah-line)',
              boxShadow: 'var(--sah-shadow)',
              padding: '28px 28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              animation: 'rise .2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'rgba(168,95,79,.12)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--danger)',
                  flex: 'none',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: 'var(--sah-navy)',
                  }}
                >
                  Hapus SKU Produk?
                </div>
                <div style={{ fontSize: 12, color: 'var(--sah-muted)' }}>
                  Penghapusan memerlukan konfirmasi (FR-CAT-05).
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--sah-frame)', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus <strong>{product.name}</strong> ({product.sku_code})? Tindakan ini akan mencabut vektor fitur visual terkait dari katalog.
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 14,
                  border: '1px solid var(--sah-line)',
                  background: 'var(--sah-white)',
                  color: 'var(--sah-navy)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 14,
                  border: 0,
                  background: 'var(--danger)',
                  color: 'var(--sah-white)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {isDeleting ? 'Menghapus…' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default ProductDetailPage;
