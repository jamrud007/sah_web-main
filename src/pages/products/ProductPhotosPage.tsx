// src/pages/products/ProductPhotosPage.tsx
// Exact 1:1 SCR-WEB-05 (Foto Referensi & Editor) from SAH Web Admin (standalone).html

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { useSahToast } from '../../context/ToastContext';
import { CH, type StatusChipDef } from '../../constants/sahNav';
import type { Product, Photo } from '../../types/apiDef';
import type { SahRole } from '../../store/authSlice';
import { updateProduct } from '../../store/productSlice';

export interface StandalonePhoto {
  id?: string;
  n: string;
  f: string;
  gr: string;
  url?: string;
  ini: string;
  st: StatusChipDef;
  warn: string | null;
  dim: string;
}

const G1 = 'linear-gradient(145deg,#477fa2,#25384a 58%,#6f3f32)';
const G2 = 'linear-gradient(130deg,#f0944d,#a84e3d 58%,#6f3f32)';
const G3 = 'linear-gradient(145deg,#24384e,#182436 60%,#4a2c22)';

const DEFAULT_STANDALONE_PHOTOS: StandalonePhoto[] = [
  { n: 'Depan', f: 'bango-275-front.jpg', gr: G1, ini: 'BG', st: CH.ok, warn: null, dim: '2048 × 2048 · 1,8 MB' },
  { n: 'Belakang', f: 'bango-275-back.jpg', gr: G1, ini: 'BG', st: CH.ok, warn: null, dim: '2048 × 2048 · 1,9 MB' },
  {
    n: 'Sisi kiri',
    f: 'bango-275-left.jpg',
    gr: G2,
    ini: 'BG',
    st: CH.wait,
    warn: 'Pantulan cahaya pada label — kontras teks rendah.',
    dim: '1536 × 1536 · 1,1 MB',
  },
  {
    n: 'Sisi kanan',
    f: 'bango-275-right.jpg',
    gr: G2,
    ini: 'BG',
    st: CH.bad,
    warn: 'Objek terpotong di tepi kanan; ekstraksi fitur ditolak.',
    dim: '1280 × 1280 · 0,9 MB',
  },
  { n: 'Tutup', f: 'bango-275-cap.jpg', gr: G1, ini: 'BG', st: CH.ok, warn: null, dim: '1536 × 1536 · 1,0 MB' },
  {
    n: 'Kemasan isi ulang',
    f: 'bango-refill.jpg',
    gr: G2,
    ini: 'BG',
    st: CH.wait,
    warn: 'Latar belakang berpola — disarankan latar polos.',
    dim: '2048 × 1536 · 1,6 MB',
  },
];

const PHOTO_TOOLS = [
  'Pangkas',
  'Putar 90°',
  'Ratakan horizon',
  'Hapus latar',
  'Naikkan kontras',
  'Tandai objek utama',
];

const ProductPhotosPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const productId = id || searchParams.get('id');

  // Search combobox state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.products.items);
  const photosByProductId = useAppSelector((s) => s.products.photosByProductId);
  const { showToast, lang } = useSahToast();

  const userInfo = useAppSelector((s) => s.auth.userInfo);
  const currentSahRole: SahRole =
    userInfo?.role === 'administrator'
      ? 'US-04'
      : (userInfo?.email?.includes('lestari') ? 'US-05' : 'US-02');
  const isReadOnly = currentSahRole === 'US-04';

  const product =
    products.find((p: Product) => p.id === productId || p.sku_code === productId) || products[0];
  const skuLabel = product ? product.sku_code : 'SKU-100241';
  const prodName = product ? product.name : 'Kecap Manis Bango 275 ml';
  const prodInitials = (product?.name || 'Bango')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'BG';

  const [photoList, setPhotoList] = useState<StandalonePhoto[]>(DEFAULT_STANDALONE_PHOTOS);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo Editor interactive tool states
  const [rotation, setRotation] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [isCropped, setIsCropped] = useState(false);
  const [isLeveled, setIsLeveled] = useState(false);
  const [removedBg, setRemovedBg] = useState(false);
  const [markedObject, setMarkedObject] = useState(true);

  // Hydrate photo list dynamically for the selected product
  useEffect(() => {
    if (!product) return;
    const attached =
      (product.photos && product.photos.length > 0)
        ? product.photos
        : (photosByProductId[product.id] || []);

    const cleanSlug = (product.name || 'produk')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 22) || 'sku';

    if (attached.length > 0) {
      const mapped: StandalonePhoto[] = attached.map((p: Photo) => ({
        id: p.id,
        n: p.angle || (p.package_side ? p.package_side.replace('_', ' ') : 'Depan'),
        f: p.file_name || `${cleanSlug}-${p.package_side || 'kemasan'}.jpg`,
        gr: G3,
        url: p.url,
        ini: prodInitials,
        st: p.status === 'indexed' || p.index_status === 'indexed' ? CH.ok : (p.status === 'failed' ? CH.bad : CH.wait),
        warn: p.qa_message || (p.status === 'failed' ? 'Ekstraksi fitur ditolak; resolusi kurang optimal.' : null),
        dim: p.dimensions || '2048 × 2048 · 1.8 MB',
      }));
      setPhotoList(mapped);
    } else {
      // Dynamic standard angles matching the selected product name and initials!
      setPhotoList([
        { n: 'Depan', f: `${cleanSlug}-depan.jpg`, gr: G1, ini: prodInitials, st: CH.ok, warn: null, dim: '2048 × 2048 · 1.8 MB' },
        { n: 'Belakang', f: `${cleanSlug}-belakang.jpg`, gr: G1, ini: prodInitials, st: CH.ok, warn: null, dim: '2048 × 2048 · 1.9 MB' },
        { n: 'Sisi kiri', f: `${cleanSlug}-sisi-kiri.jpg`, gr: G2, ini: prodInitials, st: CH.wait, warn: 'Pantulan cahaya pada label — kontras teks rendah.', dim: '1536 × 1536 · 1.1 MB' },
        { n: 'Sisi kanan', f: `${cleanSlug}-sisi-kanan.jpg`, gr: G2, ini: prodInitials, st: CH.ok, warn: null, dim: '1536 × 1536 · 1.2 MB' },
        { n: 'Tutup', f: `${cleanSlug}-tutup.jpg`, gr: G1, ini: prodInitials, st: CH.ok, warn: null, dim: '1024 × 1024 · 0.9 MB' },
        { n: 'Kemasan isi ulang', f: `${cleanSlug}-refill.jpg`, gr: G2, ini: prodInitials, st: CH.wait, warn: 'Latar belakang berpola — disarankan latar polos.', dim: '2048 × 1536 · 1.6 MB' },
      ]);
    }
  }, [product, photosByProductId, prodInitials]);

  const handleUploadMany = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newPhoto: StandalonePhoto = {
          id: `photo-up-${Date.now()}-${i}`,
          n: `Sudut ${photoList.length + i + 1}`,
          f: file.name,
          gr: G1,
          url: dataUrl,
          ini: prodInitials,
          st: CH.ok,
          warn: null,
          dim: '2048 × 2048 · 1.8 MB',
        };
        setPhotoList((prev) => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });

    showToast(
      lang === 'id'
        ? `${files.length} berkas foto berhasil diunggah.`
        : `${files.length} photos uploaded.`
    );
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyTool = (tool: string) => {
    if (isReadOnly) {
      showToast(
        lang === 'id'
          ? 'Peran US-04 hanya memiliki hak baca. Aksi pengubahan dinonaktifkan.'
          : 'Role US-04 is read-only.'
      );
      return;
    }

    const currentPhotoName = photoList[selectedPhotoIndex]?.n || 'Depan';

    switch (tool) {
      case 'Putar 90°':
        setRotation((prev) => (prev + 90) % 360);
        showToast(
          lang === 'id'
            ? `Foto "${currentPhotoName}" diputar 90°.`
            : `Rotated 90°.`
        );
        break;
      case 'Naikkan kontras':
        setHighContrast((prev) => !prev);
        showToast(
          lang === 'id'
            ? `Kontras foto "${currentPhotoName}" disesuaikan.`
            : `Contrast adjusted.`
        );
        break;
      case 'Pangkas':
        setIsCropped((prev) => !prev);
        showToast(
          lang === 'id'
            ? `Area pangkas (crop) foto "${currentPhotoName}" diaktifkan.`
            : `Crop box toggled.`
        );
        break;
      case 'Ratakan horizon':
        setIsLeveled((prev) => !prev);
        showToast(
          lang === 'id'
            ? `Horizon foto "${currentPhotoName}" diratakan secara otomatis.`
            : `Horizon auto-leveled.`
        );
        break;
      case 'Hapus latar':
        setRemovedBg((prev) => !prev);
        showToast(
          lang === 'id'
            ? `Segmentasi latar belakang foto "${currentPhotoName}" diterapkan.`
            : `Background removed.`
        );
        break;
      case 'Tandai objek utama':
        setMarkedObject((prev) => !prev);
        showToast(
          lang === 'id'
            ? `Bounding box objek utama foto "${currentPhotoName}" ditandai.`
            : `Main object boundary highlighted.`
        );
        break;
      default:
        break;
    }
  };

  const handleSaveAndReindex = async () => {
    if (isReadOnly) {
      showToast(
        lang === 'id'
          ? 'Peran US-04 hanya memiliki hak baca. Aksi pengubahan dinonaktifkan.'
          : 'Role US-04 is read-only.'
      );
      return;
    }

    const activePhoto = photoList[selectedPhotoIndex];
    if (!activePhoto) return;

    // Clear warning and mark active photo as indexed
    const updated = [...photoList];
    updated[selectedPhotoIndex] = {
      ...activePhoto,
      st: CH.ok,
      warn: null,
    };
    setPhotoList(updated);

    // If attached to a product, sync with redux
    if (product) {
      const updatedPhotos: Photo[] = updated.map((p) => ({
        id: p.id || `photo-${Math.random().toString(36).substr(2, 6)}`,
        product_id: product.id,
        url: p.url || '',
        file_name: p.f,
        angle: p.n,
        dimensions: p.dim,
        status: 'indexed',
        index_status: 'indexed',
        is_primary: p.n.toLowerCase().includes('depan'),
      }));
      dispatch(
        updateProduct({
          id: product.id,
          payload: { photos: updatedPhotos, index_status: 'indexed' },
        })
      );
    }

    showToast(
      lang === 'id'
        ? `Foto sudut "${activePhoto.n}" disimpan & diindeks ulang ke basis data visual (API-017). Jejak audit ENT-29 dicatat.`
        : `Saved and re-indexed to visual database (API-017).`
    );
  };

  const activePhoto = photoList[selectedPhotoIndex] || photoList[0];

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
                        navigate(`/produk/foto/${p.id || p.sku_code}`);
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
            {prodName} · {skuLabel}
          </span>
          <button
            onClick={() => navigate(`/produk/detail/${product?.id || product?.sku_code}`)}
            style={{
              height: 34,
              padding: '0 14px',
              borderRadius: 10,
              border: '1px solid var(--sah-line)',
              background: 'var(--sah-white)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--sah-navy)',
              cursor: 'pointer',
            }}
          >
            {lang === 'id' ? 'Detail SKU ↗' : 'SKU Detail ↗'}
          </button>
        </div>
      </div>

      {/* 2-Column Photo Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 320px',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUploadMany}
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          disabled={isReadOnly}
        />

        {/* ── LEFT COLUMN: PHOTOS GRID ────────────────────────── */}
        <div
          style={{
            background: 'var(--sah-white)',
            border: '1px solid var(--sah-line)',
            borderRadius: 24,
            boxShadow: 'var(--sah-shadow)',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 15.5,
                  color: 'var(--sah-navy)',
                }}
              >
                Foto referensi — {prodName} ({skuLabel})
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sah-muted)', marginTop: 2 }}>
                {product?.manufacturer ? `Produsen: ${product.manufacturer} · ` : ''}Satu SKU dapat memiliki lebih dari satu foto referensi (AR-03). Status pengindeksan dicatat per foto (ENT-06).
              </div>
            </div>

          <button
            type="button"
            disabled={isReadOnly}
            onClick={() => !isReadOnly && fileInputRef.current?.click()}
            style={{
              height: 38,
              padding: '0 16px',
              border: '1px dashed var(--sah-copper)',
              borderRadius: 14,
              background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-copper-pale)',
              color: isReadOnly ? 'var(--sah-muted)' : 'var(--sah-frame)',
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: isReadOnly ? 'not-allowed' : 'pointer',
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isReadOnly) e.currentTarget.style.background = '#ebd5c5';
            }}
            onMouseLeave={(e) => {
              if (!isReadOnly) e.currentTarget.style.background = 'var(--sah-copper-pale)';
            }}
          >
            + Unggah banyak berkas
          </button>
        </div>

        {/* Photos Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(212px, 1fr))',
            gap: 14,
          }}
        >
          {photoList.map((p, idx) => {
            const isSelected = selectedPhotoIndex === idx;
            const hasUrl = Boolean(p.url);

            return (
              <div
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                style={{
                  border: isSelected
                    ? '2px solid var(--sah-copper)'
                    : '1px solid var(--sah-line)',
                  borderRadius: 19,
                  overflow: 'hidden',
                  background: 'var(--sah-ivory)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all .15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(197,138,99,.2)' : 'none',
                }}
              >
                <div
                  style={{
                    height: 132,
                    background: hasUrl ? `url(${p.url}) center / cover no-repeat` : p.gr,
                    display: 'grid',
                    placeItems: 'center',
                    position: 'relative',
                  }}
                >
                  {!hasUrl && (
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: 28,
                        color: 'rgba(255,253,248,.9)',
                        letterSpacing: -1,
                      }}
                    >
                      {p.ini}
                    </span>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: 10,
                      padding: '4px 9px',
                      borderRadius: 999,
                      background: 'var(--sah-glass)',
                      backdropFilter: 'blur(4px)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: 'var(--sah-navy)',
                    }}
                  >
                    {p.n}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: 10,
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: 'var(--sah-copper)',
                        boxShadow: '0 0 6px var(--sah-copper)',
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    padding: '12px 13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--sah-navy)',
                    }}
                    title={p.f}
                  >
                    {p.f}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--sah-muted)' }}>{p.dim}</div>
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 11px',
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: p.st.bg,
                      border: `1px solid ${p.st.bd}`,
                      color: 'var(--sah-frame)',
                    }}
                  >
                    <span style={{ fontSize: 9, color: p.st.gc }}>{p.st.g}</span>
                    {lang === 'id' ? p.st.id : p.st.en}
                  </span>

                  {p.warn && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 7,
                        padding: '9px 10px',
                        borderRadius: 13,
                        background: 'rgba(168,95,79,.1)',
                        border: '1px solid var(--sah-line)',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--danger)',
                          fontSize: 9,
                          lineHeight: '18px',
                        }}
                      >
                        ▲
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--sah-frame)', lineHeight: 1.4 }}>
                        {p.warn}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT COLUMN: STICKY PHOTO EDITOR ────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 88,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Editor Box */}
        <div
          style={{
            background: 'var(--sah-white)',
            border: '1px solid var(--sah-line)',
            borderRadius: 24,
            boxShadow: 'var(--sah-shadow)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
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
            Editor foto — {activePhoto?.n || 'Depan'}
          </div>

          {/* Interactive Workspace / Canvas */}
          <div
            style={{
              height: 168,
              borderRadius: 17,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,.25)',
              background: '#17243a',
            }}
          >
            {/* Inner background & image layer with smooth transform */}
            <div
              style={{
                position: 'absolute',
                inset: -60,
                background: removedBg
                  ? '#ffffff'
                  : (activePhoto?.url
                    ? `url(${activePhoto.url}) center / cover no-repeat`
                    : activePhoto?.gr || G1),
                display: 'grid',
                placeItems: 'center',
                filter: highContrast ? 'contrast(135%) brightness(1.05)' : 'none',
                transform: `rotate(${rotation}deg) scale(${isCropped ? 1.2 : 1}) rotate(${isLeveled ? -2 : 0}deg)`,
                transformOrigin: 'center center',
                transition: 'transform .25s ease, filter .2s ease, background .2s ease',
              }}
            >
              {!activePhoto?.url && !removedBg && (
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 34,
                    color: 'rgba(255,253,248,.9)',
                    letterSpacing: -1,
                  }}
                >
                  {activePhoto?.ini || prodInitials}
                </span>
              )}
            </div>

            {/* Area Objek Utama Dashed Box (Pinned cleanly within frame) */}
            <div
              style={{
                position: 'absolute',
                inset: 20,
                border: markedObject
                  ? '2px dashed rgba(255,253,248,.75)'
                  : '2px dashed rgba(255,253,248,.35)',
                borderRadius: 12,
                boxShadow: markedObject ? '0 0 12px rgba(197,138,99,.5)' : 'none',
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '1.4px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,253,248,.9)',
                  background: 'rgba(23,36,58,.5)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  backdropFilter: 'blur(4px)',
                }}
              >
                Area objek utama
              </span>
            </div>
          </div>

          {/* Tool Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {PHOTO_TOOLS.map((tool) => {
              const isToolActive =
                (tool === 'Putar 90°' && rotation !== 0) ||
                (tool === 'Naikkan kontras' && highContrast) ||
                (tool === 'Pangkas' && isCropped) ||
                (tool === 'Ratakan horizon' && isLeveled) ||
                (tool === 'Hapus latar' && removedBg) ||
                (tool === 'Tandai objek utama' && markedObject);

              return (
                <button
                  key={tool}
                  disabled={isReadOnly}
                  onClick={() => handleApplyTool(tool)}
                  style={{
                    height: 32,
                    padding: '0 12px',
                    border: `1px solid ${isToolActive ? 'var(--sah-copper)' : 'var(--sah-line)'}`,
                    borderRadius: 999,
                    background: isToolActive
                      ? 'var(--sah-copper-pale)'
                      : (isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)'),
                    fontSize: 12,
                    fontWeight: 600,
                    color: isReadOnly ? 'var(--sah-muted)' : 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'pointer',
                    transition: 'all .12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isReadOnly && !isToolActive) {
                      e.currentTarget.style.borderColor = 'var(--sah-copper)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isReadOnly && !isToolActive) {
                      e.currentTarget.style.borderColor = 'var(--sah-line)';
                    }
                  }}
                >
                  {tool}
                </button>
              );
            })}
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            disabled={isReadOnly}
            onClick={handleSaveAndReindex}
            style={{
              height: 44,
              border: 0,
              borderRadius: 15,
              background: isReadOnly ? 'rgba(197,138,99,.4)' : 'var(--sah-copper)',
              color: 'var(--sah-white)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              textAlign: 'left',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
            <span>Simpan &amp; indeks ulang</span>
            <span>→</span>
          </button>
        </div>

        {/* Quality Warning Box */}
        <div
          style={{
            background: 'var(--sah-mist-soft)',
            border: '1px solid var(--sah-line)',
            borderRadius: 22,
            padding: '18px 20px',
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: 'var(--sah-copper-dark)',
            }}
          >
            Peringatan mutu
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--sah-frame)',
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            Foto dengan pantulan, latar berpola, atau objek terpotong menurunkan skor kemiripan. Ganti foto yang ditandai sebelum menutup SKU (FR-CAT-08, -09).
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default ProductPhotosPage;
