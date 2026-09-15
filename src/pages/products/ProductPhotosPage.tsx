// src/pages/products/ProductPhotosPage.tsx
// SCR-WEB-05 (Foto Referensi & Editor) - Integrated with Live API
// POST /api/v1/products/{product_id}/photos (Upload)
// DELETE /api/v1/products/{product_id}/photos/{photo_id} (Delete)
// POST /api/v1/products/{product_id}/photos/{photo_id}/reindex (Reindex)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { useSahToast } from '../../context/ToastContext';
import { CH, type StatusChipDef } from '../../constants/sahNav';
import type { Product, Photo, BackendPhotoPackageSide } from '../../types/apiDef';
import { checkIsReadOnly } from '../../store/authSlice';
import {
  fetchProducts,
  fetchProductById,
  uploadPhoto,
  deletePhoto,
  reindexPhoto,
  updateProduct,
} from '../../store/productSlice';
import {
  normalizePackageSide,
  packageSideDisplayLabel,
} from '../../services/photoService';

export interface StandalonePhoto {
  id?: string;
  packageSide?: BackendPhotoPackageSide;
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

const PACKAGE_SIDES: { value: BackendPhotoPackageSide; labelId: string; labelEn: string }[] = [
  { value: 'front', labelId: 'Depan (front)', labelEn: 'Front' },
  { value: 'back', labelId: 'Belakang (back)', labelEn: 'Back' },
  { value: 'left', labelId: 'Sisi Kiri (left)', labelEn: 'Left Side' },
  { value: 'right', labelId: 'Sisi Kanan (right)', labelEn: 'Right Side' },
  { value: 'top', labelId: 'Tutup / Atas (top)', labelEn: 'Top / Cap' },
  { value: 'bottom', labelId: 'Bawah (bottom)', labelEn: 'Bottom' },
  { value: 'other', labelId: 'Kemasan Isi Ulang / Lainnya (other)', labelEn: 'Other / Refill' },
];

const DEFAULT_STANDALONE_PHOTOS: StandalonePhoto[] = [
  { n: 'Depan', packageSide: 'front', f: 'bango-275-front.jpg', gr: G1, ini: 'BG', st: CH.ok, warn: null, dim: '2048 × 2048 · 1,8 MB' },
  { n: 'Belakang', packageSide: 'back', f: 'bango-275-back.jpg', gr: G1, ini: 'BG', st: CH.ok, warn: null, dim: '2048 × 2048 · 1,9 MB' },
  {
    n: 'Sisi kiri',
    packageSide: 'left',
    f: 'bango-275-left.jpg',
    gr: G2,
    ini: 'BG',
    st: CH.wait,
    warn: 'Pantulan cahaya pada label — kontras teks rendah.',
    dim: '1536 × 1536 · 1,1 MB',
  },
  {
    n: 'Sisi kanan',
    packageSide: 'right',
    f: 'bango-275-right.jpg',
    gr: G2,
    ini: 'BG',
    st: CH.bad,
    warn: 'Objek terpotong di tepi kanan; ekstraksi fitur ditolak.',
    dim: '1280 × 1280 · 0,9 MB',
  },
  { n: 'Tutup', packageSide: 'top', f: 'bango-275-cap.jpg', gr: G1, ini: 'BG', st: CH.ok, warn: null, dim: '1536 × 1536 · 1,0 MB' },
  {
    n: 'Kemasan isi ulang',
    packageSide: 'other',
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
  const isReadOnly = checkIsReadOnly(userInfo);

  // Ensure products list is loaded from backend on mount
  useEffect(() => {
    if (products.length <= 10) {
      dispatch(fetchProducts({ reset: true }));
    }
  }, [dispatch, products.length]);

  // If specific productId provided, fetch it if missing
  useEffect(() => {
    if (productId && !products.some((p) => p.id === productId || p.sku_code === productId)) {
      dispatch(fetchProductById(productId));
    }
  }, [dispatch, productId, products]);

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

  // Operation loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [deleteTargetPhoto, setDeleteTargetPhoto] = useState<StandalonePhoto | null>(null);

  // Photo Editor interactive tool states
  const [rotation, setRotation] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [isCropped, setIsCropped] = useState(false);
  const [isLeveled, setIsLeveled] = useState(false);
  const [removedBg, setRemovedBg] = useState(false);
  const [markedObject, setMarkedObject] = useState(true);

  // Helper to map status to chip
  const mapPhotoStatusChip = (status?: string, indexStatus?: string): StatusChipDef => {
    const st = (status || indexStatus || 'indexed').toLowerCase();
    if (st === 'indexed') return CH.ok;
    if (st === 'failed') return CH.bad;
    return CH.wait;
  };

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
      const mapped: StandalonePhoto[] = attached.map((p: Photo) => {
        const side = normalizePackageSide(p.package_side || p.angle);
        const displayName = packageSideDisplayLabel(side, lang);
        return {
          id: p.id,
          packageSide: side,
          n: displayName,
          f: p.file_name || `${cleanSlug}-${side}.jpg`,
          gr: G3,
          url: p.url,
          ini: prodInitials,
          st: mapPhotoStatusChip(p.status, p.index_status),
          warn: p.qa_message || (p.status === 'failed' ? 'Ekstraksi fitur ditolak; resolusi kurang optimal.' : null),
          dim: p.dimensions || '2048 × 2048 · 1.8 MB',
        };
      });
      setPhotoList(mapped);
      setSelectedPhotoIndex(0);
    } else {
      // Dynamic standard default photos
      setPhotoList([
        { n: 'Depan', packageSide: 'front', f: `${cleanSlug}-depan.jpg`, gr: G1, ini: prodInitials, st: CH.ok, warn: null, dim: '2048 × 2048 · 1.8 MB' },
        { n: 'Belakang', packageSide: 'back', f: `${cleanSlug}-belakang.jpg`, gr: G1, ini: prodInitials, st: CH.ok, warn: null, dim: '2048 × 2048 · 1.9 MB' },
        { n: 'Sisi kiri', packageSide: 'left', f: `${cleanSlug}-sisi-kiri.jpg`, gr: G2, ini: prodInitials, st: CH.wait, warn: 'Pantulan cahaya pada label — kontras teks rendah.', dim: '1536 × 1536 · 1.1 MB' },
        { n: 'Sisi kanan', packageSide: 'right', f: `${cleanSlug}-sisi-kanan.jpg`, gr: G2, ini: prodInitials, st: CH.ok, warn: null, dim: '1536 × 1536 · 1.2 MB' },
        { n: 'Tutup', packageSide: 'top', f: `${cleanSlug}-tutup.jpg`, gr: G1, ini: prodInitials, st: CH.ok, warn: null, dim: '1024 × 1024 · 0.9 MB' },
        { n: 'Kemasan isi ulang', packageSide: 'other', f: `${cleanSlug}-refill.jpg`, gr: G2, ini: prodInitials, st: CH.wait, warn: 'Latar belakang berpola — disarankan latar polos.', dim: '2048 × 1536 · 1.6 MB' },
      ]);
      setSelectedPhotoIndex(0);
    }
  }, [product, photosByProductId, prodInitials, lang]);

  // ─── 1. UPLOAD PHOTO (POST /api/v1/products/{product_id}/photos) ─────────────
  const handleUploadMany = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly || !product) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    const errors: string[] = [];

    const sideOrder: BackendPhotoPackageSide[] = ['front', 'back', 'left', 'right', 'top', 'bottom', 'other'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Automatically determine package side
      const assignedSide: BackendPhotoPackageSide =
        sideOrder[(photoList.length + i) % sideOrder.length];

      try {
        const actionResult = await dispatch(
          uploadPhoto({
            productId: product.id,
            file,
            packageSide: assignedSide,
          })
        ).unwrap();

        const uploadedPhoto = actionResult.photo;
        const newPhotoItem: StandalonePhoto = {
          id: uploadedPhoto.id,
          packageSide: assignedSide,
          n: packageSideDisplayLabel(assignedSide, lang),
          f: file.name,
          gr: G1,
          url: uploadedPhoto.url,
          ini: prodInitials,
          st: CH.wait, // 202 Accepted returns PENDING
          warn: null,
          dim: `${(file.size / (1024 * 1024)).toFixed(1)} MB · unggahan baru`,
        };

        setPhotoList((prev) => [...prev, newPhotoItem]);
        successCount++;
      } catch (err: any) {
        errors.push(`${file.name}: ${err}`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      setSelectedPhotoIndex(photoList.length + successCount - 1);
      showToast(
        lang === 'id'
          ? `${successCount} berkas foto berhasil diunggah (API-016 / 202 Accepted). Status antrean: PENDING.`
          : `${successCount} photos uploaded (API-016 / 202 Accepted). Status: PENDING.`
      );
    }

    if (errors.length > 0) {
      showToast(
        lang === 'id'
          ? `Sebagian unggahan ditolak server: ${errors[0]}`
          : `Upload failed: ${errors[0]}`
      );
    }
  };

  // ─── 2. REINDEX PHOTO (POST /api/v1/products/{product_id}/photos/{photo_id}/reindex)
  const handleReindex = async () => {
    if (isReadOnly || !product) {
      showToast(
        lang === 'id'
          ? 'Peran US-04 hanya memiliki hak baca. Aksi pengubahan dinonaktifkan.'
          : 'Role US-04 is read-only.'
      );
      return;
    }

    const activePhoto = photoList[selectedPhotoIndex];
    if (!activePhoto) return;

    setIsReindexing(true);

    try {
      const targetPhotoId = activePhoto.id || `photo-mock-${selectedPhotoIndex}`;
      await dispatch(
        reindexPhoto({
          productId: product.id,
          photoId: targetPhotoId,
        })
      ).unwrap();

      // Update active photo state to CH.wait (PENDING 202 Accepted)
      const updated = [...photoList];
      updated[selectedPhotoIndex] = {
        ...activePhoto,
        st: CH.wait,
        warn: null,
      };
      setPhotoList(updated);

      showToast(
        lang === 'id'
          ? `Permintaan indeks ulang foto "${activePhoto.n}" berhasil dikirim (API-017 / 202 Accepted). Status antrean: PENDING.`
          : `Reindex requested for "${activePhoto.n}" (API-017 / 202 Accepted). Status: PENDING.`
      );
    } catch (err: any) {
      showToast(
        lang === 'id'
          ? `Gagal melakukan indeks ulang: ${err}`
          : `Reindex failed: ${err}`
      );
    } finally {
      setIsReindexing(false);
    }
  };

  // ─── 3. DELETE PHOTO (DELETE /api/v1/products/{product_id}/photos/{photo_id})
  const handleConfirmDelete = async () => {
    if (isReadOnly || !product || !deleteTargetPhoto) return;

    setIsDeletingPhoto(true);

    try {
      const targetPhotoId = deleteTargetPhoto.id || `photo-mock-${selectedPhotoIndex}`;
      await dispatch(
        deletePhoto({
          productId: product.id,
          photoId: targetPhotoId,
        })
      ).unwrap();

      // Remove from local list
      const updatedList = photoList.filter(
        (p) => p.id !== deleteTargetPhoto.id || (p.f !== deleteTargetPhoto.f)
      );
      setPhotoList(updatedList);

      // Adjust selected index
      if (selectedPhotoIndex >= updatedList.length) {
        setSelectedPhotoIndex(Math.max(0, updatedList.length - 1));
      }

      showToast(
        lang === 'id'
          ? `Foto sudut "${deleteTargetPhoto.n}" (${deleteTargetPhoto.f}) berhasil dihapus (API-018). Vektor fitur dicabut.`
          : `Photo "${deleteTargetPhoto.n}" deleted (API-018).`
      );
    } catch (err: any) {
      showToast(
        lang === 'id'
          ? `Gagal menghapus foto: ${err}`
          : `Failed to delete photo: ${err}`
      );
    } finally {
      setIsDeletingPhoto(false);
      setDeleteTargetPhoto(null);
    }
  };

  // ─── 4. SAVE & REINDEX (COMBO ACTION) ─────────────────────────────────────────
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

    // Trigger real reindex API call
    await handleReindex();

    // Sync product photos locally / with redux update
    if (product) {
      const updatedPhotos: Photo[] = photoList.map((p) => ({
        id: p.id || `photo-${Math.random().toString(36).substr(2, 6)}`,
        product_id: product.id,
        url: p.url || '',
        file_name: p.f,
        package_side: p.packageSide || normalizePackageSide(p.n),
        angle: p.n,
        dimensions: p.dim,
        status: 'pending',
        index_status: 'pending',
        is_primary: p.n.toLowerCase().includes('depan'),
      }));
      dispatch(
        updateProduct({
          id: product.id,
          payload: { photos: updatedPhotos, index_status: 'pending' },
        })
      );
    }
  };

  // ─── 5. CHANGE PACKAGE SIDE IN EDITOR ─────────────────────────────────────────
  const handleChangePackageSide = (newSide: BackendPhotoPackageSide) => {
    if (isReadOnly) return;
    const updated = [...photoList];
    const current = updated[selectedPhotoIndex];
    if (!current) return;

    const newLabel = packageSideDisplayLabel(newSide, lang);
    updated[selectedPhotoIndex] = {
      ...current,
      packageSide: newSide,
      n: newLabel,
    };
    setPhotoList(updated);
    showToast(
      lang === 'id'
        ? `Sisi kemasan diubah ke "${newLabel}".`
        : `Package side changed to "${newLabel}".`
    );
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
              onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
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
          gridTemplateColumns: 'minmax(0,1fr) 340px',
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
          disabled={isReadOnly || isUploading}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>Foto referensi — {prodName} ({skuLabel})</span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'var(--sah-copper-pale)',
                    color: 'var(--sah-copper-dark)',
                  }}
                >
                  {photoList.length} Foto
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sah-muted)', marginTop: 2 }}>
                {product?.manufacturer ? `Produsen: ${product.manufacturer} · ` : ''}
                Satu SKU dapat memiliki lebih dari satu foto referensi (AR-03).
                Status pengindeksan visual dicatat per foto (ENT-06).
              </div>
            </div>

            {/* Upload Button */}
            <button
              type="button"
              disabled={isReadOnly || isUploading}
              onClick={() => !isReadOnly && !isUploading && fileInputRef.current?.click()}
              style={{
                height: 40,
                padding: '0 18px',
                border: '1px dashed var(--sah-copper)',
                borderRadius: 14,
                background: isReadOnly
                  ? 'rgba(23,36,58,.04)'
                  : (isUploading ? 'var(--sah-ivory)' : 'var(--sah-copper-pale)'),
                color: isReadOnly ? 'var(--sah-muted)' : 'var(--sah-frame)',
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                cursor: (isReadOnly || isUploading) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all .15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isReadOnly && !isUploading) e.currentTarget.style.background = '#ebd5c5';
              }}
              onMouseLeave={(e) => {
                if (!isReadOnly && !isUploading) e.currentTarget.style.background = 'var(--sah-copper-pale)';
              }}
            >
              {isUploading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                  <span>Mengunggah ke server…</span>
                </>
              ) : (
                <>
                  <span>+</span>
                  <span>{lang === 'id' ? 'Unggah Foto (API-016)' : 'Upload Photo'}</span>
                </>
              )}
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
                  key={p.id || idx}
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
                    boxShadow: isSelected ? '0 4px 14px rgba(197,138,99,.22)' : 'none',
                    position: 'relative',
                  }}
                >
                  {/* Photo Preview Thumbnail */}
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

                    {/* Angle / Side badge */}
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

                    {/* Card Quick Delete Button */}
                    {!isReadOnly && (
                      <button
                        type="button"
                        title={lang === 'id' ? 'Hapus foto ini' : 'Delete photo'}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setDeleteTargetPhoto(p);
                        }}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: 10,
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          border: 'none',
                          background: 'rgba(23,36,58,.65)',
                          backdropFilter: 'blur(4px)',
                          color: '#ff6b6b',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 12,
                          cursor: 'pointer',
                          transition: 'all .15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e03131';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(23,36,58,.65)';
                          e.currentTarget.style.color = '#ff6b6b';
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  {/* Card Metadata */}
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
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'var(--sah-ivory)',
                  color: 'var(--sah-muted)',
                  border: '1px solid var(--sah-line)',
                }}
              >
                {activePhoto?.f}
              </span>
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

              {/* Area Objek Utama Dashed Box */}
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

            {/* Package Side Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--sah-navy)' }}>
                  {lang === 'id' ? 'Sisi Kemasan (API Enum):' : 'Package Side (API):'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--sah-muted)' }}>
                  POST /photos
                </span>
              </div>
              <select
                disabled={isReadOnly}
                value={activePhoto?.packageSide || normalizePackageSide(activePhoto?.n)}
                onChange={(e) => handleChangePackageSide(e.target.value as BackendPhotoPackageSide)}
                style={{
                  height: 36,
                  borderRadius: 11,
                  border: '1px solid var(--sah-line)',
                  background: 'var(--sah-ivory)',
                  color: 'var(--sah-navy)',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '0 10px',
                  outline: 'none',
                  cursor: isReadOnly ? 'not-allowed' : 'pointer',
                }}
              >
                {PACKAGE_SIDES.map((side) => (
                  <option key={side.value} value={side.value}>
                    {side.labelId}
                  </option>
                ))}
              </select>
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

            {/* Actions: Reindex & Save */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {/* 1. Quick Reindex Button */}
              <button
                type="button"
                disabled={isReadOnly || isReindexing}
                onClick={handleReindex}
                style={{
                  height: 38,
                  border: '1px solid var(--sah-copper)',
                  borderRadius: 13,
                  background: 'var(--sah-copper-pale)',
                  color: 'var(--sah-frame)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 12.5,
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: (isReadOnly || isReindexing) ? 'not-allowed' : 'pointer',
                  transition: 'background .15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isReadOnly && !isReindexing) e.currentTarget.style.background = '#ebd5c5';
                }}
                onMouseLeave={(e) => {
                  if (!isReadOnly && !isReindexing) e.currentTarget.style.background = 'var(--sah-copper-pale)';
                }}
              >
                <span>{isReindexing ? 'Memproses ke antrean…' : 'Indeks Ulang Foto (API-017)'}</span>
                <span>{isReindexing ? '⏳' : '⚡'}</span>
              </button>

              {/* 2. Save and Reindex Button */}
              <button
                type="button"
                disabled={isReadOnly || isReindexing}
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
                  cursor: (isReadOnly || isReindexing) ? 'not-allowed' : 'pointer',
                  transition: 'background .15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isReadOnly && !isReindexing) e.currentTarget.style.background = 'var(--sah-copper-pressed)';
                }}
                onMouseLeave={(e) => {
                  if (!isReadOnly && !isReindexing) e.currentTarget.style.background = 'var(--sah-copper)';
                }}
              >
                <span>{isReindexing ? 'Menyimpan & mereindeks…' : 'Simpan & indeks ulang'}</span>
                <span>→</span>
              </button>

              {/* 3. Delete Photo Button */}
              {!isReadOnly && (
                <button
                  type="button"
                  disabled={isDeletingPhoto}
                  onClick={() => setDeleteTargetPhoto(activePhoto)}
                  style={{
                    height: 36,
                    border: '1px solid rgba(224,49,49,.3)',
                    borderRadius: 12,
                    background: 'rgba(224,49,49,.06)',
                    color: '#c92a2a',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all .15s ease',
                    marginTop: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(224,49,49,.14)';
                    e.currentTarget.style.borderColor = 'rgba(224,49,49,.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(224,49,49,.06)';
                    e.currentTarget.style.borderColor = 'rgba(224,49,49,.3)';
                  }}
                >
                  <span>🗑️</span>
                  <span>{lang === 'id' ? 'Hapus Foto Ini (API-018)' : 'Delete This Photo'}</span>
                </button>
              )}
            </div>
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
              Peringatan mutu &amp; API
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--sah-frame)',
                marginTop: 8,
                lineHeight: 1.5,
              }}
            >
              • Unggah foto memanggil endpoint <code>POST /photos</code> (202 PENDING).
              <br />
              • Hapus foto memanggil <code>DELETE /photos/{'{id}'}</code> (202 DELETE_PENDING).
              <br />
              • Indeks ulang memicu ekstraksi fitur Milvus via <code>POST /reindex</code>.
            </div>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────── */}
      {deleteTargetPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23,36,58,.45)',
            backdropFilter: 'blur(5px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => !isDeletingPhoto && setDeleteTargetPhoto(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--sah-white)',
              borderRadius: 24,
              border: '1px solid var(--sah-line)',
              boxShadow: '0 20px 48px rgba(23,36,58,.22)',
              width: '100%',
              maxWidth: 440,
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: 'rgba(224,49,49,.1)',
                  color: '#c92a2a',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 20,
                }}
              >
                ⚠️
              </span>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--sah-navy)',
                  }}
                >
                  {lang === 'id' ? 'Hapus Foto Referensi?' : 'Delete Reference Photo?'}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--sah-muted)' }}>
                  DELETE /api/v1/products/{product?.id || '{product_id}'}/photos/{deleteTargetPhoto.id || '{photo_id}'}
                </span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: 'var(--sah-frame)', lineHeight: 1.5 }}>
              {lang === 'id' ? (
                <>
                  Apakah Anda yakin ingin menghapus foto sudut <strong>"{deleteTargetPhoto.n}"</strong> ({deleteTargetPhoto.f}) untuk produk <strong>{prodName}</strong>? Tindakan ini akan mencabut vektor fitur visual dari basis data.
                </>
              ) : (
                <>
                  Are you sure you want to delete photo <strong>"{deleteTargetPhoto.n}"</strong> ({deleteTargetPhoto.f})?
                </>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                disabled={isDeletingPhoto}
                onClick={() => setDeleteTargetPhoto(null)}
                style={{
                  height: 38,
                  padding: '0 16px',
                  borderRadius: 12,
                  border: '1px solid var(--sah-line)',
                  background: 'var(--sah-ivory)',
                  color: 'var(--sah-navy)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isDeletingPhoto ? 'not-allowed' : 'pointer',
                }}
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeletingPhoto}
                onClick={handleConfirmDelete}
                style={{
                  height: 38,
                  padding: '0 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#e03131',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: isDeletingPhoto ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isDeletingPhoto ? (
                  <>
                    <span>⏳</span>
                    <span>Menghapus…</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>{lang === 'id' ? 'Hapus Foto (API-018)' : 'Delete Photo'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPhotosPage;
