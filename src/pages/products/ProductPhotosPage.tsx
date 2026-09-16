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
  formatPhotoTimestamp,
  formatPhotoFileName,
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
  extractionStatus?: string;
  uploadedAt?: string;
}

const G1 = 'linear-gradient(145deg,#477fa2,#25384a 58%,#6f3f32)';
const G3 = 'linear-gradient(145deg,#24384e,#182436 60%,#4a2c22)';

const PHOTO_TOOLS = [
  'Pangkas (Crop Focus)',
  'Putar 90°',
  'Ratakan Horizon',
  'Hapus Latar (Simulasi)',
  'Naikkan Kontras',
  'Tandai Objek Utama',
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
  const selectedProduct = useAppSelector((s) => s.products.selectedProduct);
  const activeProductId = productId || products[0]?.id;

  // Ensure products list is loaded from backend on mount
  useEffect(() => {
    if (products.length <= 10) {
      dispatch(fetchProducts({ reset: true }));
    }
  }, [dispatch, products.length]);

  // Always fetch full product with photos whenever activeProductId changes
  useEffect(() => {
    if (activeProductId) {
      dispatch(fetchProductById(activeProductId));
    }
  }, [dispatch, activeProductId]);

  const product =
    (selectedProduct && (selectedProduct.id === activeProductId || selectedProduct.sku_code === activeProductId))
      ? selectedProduct
      : products.find((p: Product) => p.id === activeProductId || p.sku_code === activeProductId) || products[0];
  const skuLabel = product ? product.sku_code : '—';
  const prodName = product ? product.name : (products.length === 0 ? 'Katalog Kosong' : 'Pilih Produk');
  const prodInitials = (product?.name || 'PR')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'PR';

  const [photoList, setPhotoList] = useState<StandalonePhoto[]>([]);
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

    if (attached.length > 0) {
      const sideCounts: Record<string, number> = {};
      const brandName = product.brand || product.name || product.sku_code || 'produk';
      const mapped: StandalonePhoto[] = attached.map((p: Photo) => {
        const side = normalizePackageSide(p.package_side || p.angle);
        const sideIndex = sideCounts[side] || 0;
        sideCounts[side] = sideIndex + 1;
        const imageName = formatPhotoFileName(brandName, side, sideIndex);
        return {
          id: p.id,
          packageSide: side,
          n: imageName,
          f: imageName,
          gr: G3,
          url: p.url,
          ini: prodInitials,
          st: mapPhotoStatusChip(p.status, p.index_status),
          warn: p.qa_message || (p.status === 'failed' ? 'Ekstraksi fitur ditolak; resolusi kurang optimal.' : null),
          dim: p.dimensions || '2048 × 2048 · 1.8 MB',
          extractionStatus: p.extraction_status,
          uploadedAt: p.uploaded_at || p.created_at,
        };
      });
      setPhotoList(mapped);
      setSelectedPhotoIndex(0);
    } else {
      setPhotoList([]);
      setSelectedPhotoIndex(0);
    }
  }, [product, photosByProductId, prodInitials]);

  // ─── 1. UPLOAD PHOTO (POST /api/v1/products/{product_id}/photos) ─────────────
  const handleUploadMany = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly || !product) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoNum = photoList.length + i + 1;
      const indexStr = String(photoNum).padStart(2, '0');
      const imageName = `image ${indexStr}`;

      try {
        const actionResult = await dispatch(
          uploadPhoto({
            productId: product.id,
            file,
            packageSide: 'other',
          })
        ).unwrap();

        const uploadedPhoto = actionResult.photo;
        const newPhotoItem: StandalonePhoto = {
          id: uploadedPhoto.id,
          packageSide: 'other',
          n: imageName,
          f: imageName,
          gr: G1,
          url: uploadedPhoto.url,
          ini: prodInitials,
          st: CH.wait, // 202 Accepted returns PENDING
          warn: null,
          dim: `${(file.size / (1024 * 1024)).toFixed(1)} MB · unggahan baru`,
          extractionStatus: 'pending',
          uploadedAt: new Date().toISOString(),
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
    if (!activePhoto?.id) {
      showToast(lang === 'id' ? 'Foto tidak memiliki ID valid di server.' : 'Photo does not have a valid server ID.');
      return;
    }

    setIsReindexing(true);

    try {
      const targetPhotoId = activePhoto.id;
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
          ? `Permintaan indeks ulang foto "${activePhoto.n}" berhasil dikirim (API-017 / 202 Accepted). Menunggu proses antrean…`
          : `Reindex requested for "${activePhoto.n}" (API-017 / 202 Accepted). Awaiting queue…`
      );

      // Status polling (check backend status up to 4 times, every 4 seconds)
      let attempts = 0;
      const pollTimer = setInterval(async () => {
        attempts++;
        try {
          const freshProduct = await dispatch(fetchProductById(product.id)).unwrap();
          const freshPhotos = freshProduct.photos || [];
          const refreshed = freshPhotos.find((p: any) => p.id === targetPhotoId);
          if (refreshed) {
            const extStatus = refreshed.extraction_status || refreshed.status;
            if (extStatus === 'extracted' || extStatus === 'indexed') {
              clearInterval(pollTimer);
              showToast(
                lang === 'id'
                  ? `Foto "${activePhoto.n}" selesai diindeks. Vektor fitur visual diperbarui.`
                  : `Photo "${activePhoto.n}" reindexed successfully. Visual feature vectors updated.`
              );
            } else if (extStatus === 'failed') {
              clearInterval(pollTimer);
              showToast(
                lang === 'id'
                  ? `Ekstraksi indeks ulang foto "${activePhoto.n}" ditolak oleh model AI.`
                  : `Reindexing for "${activePhoto.n}" rejected by AI model.`
              );
            }
          }
        } catch {
          // ignore transient poll error
        }
        if (attempts >= 4) {
          clearInterval(pollTimer);
        }
      }, 4000);
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
    if (!deleteTargetPhoto?.id) {
      showToast(lang === 'id' ? 'Foto tidak memiliki ID valid di server.' : 'Photo does not have a valid server ID.');
      return;
    }

    setIsDeletingPhoto(true);

    try {
      const targetPhotoId = deleteTargetPhoto.id;
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
          : `Foto "${deleteTargetPhoto.f || deleteTargetPhoto.n}" berhasil dihapus (API-018). Vektor fitur dicabut.`
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
      const updatedPhotos: Photo[] = photoList.map((p, idx) => ({
        id: p.id || `photo-${Math.random().toString(36).substr(2, 6)}`,
        product_id: product.id,
        url: p.url || '',
        file_name: p.f,
        package_side: p.packageSide || 'other',
        angle: p.n,
        dimensions: p.dim,
        status: 'pending',
        index_status: 'pending',
        is_primary: idx === 0,
      }));
      dispatch(
        updateProduct({
          id: product.id,
          payload: { photos: updatedPhotos, index_status: 'pending' },
        })
      );
    }
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

    const currentPhotoName = photoList[selectedPhotoIndex]?.f || `Foto ${selectedPhotoIndex + 1}`;

    if (tool.startsWith('Putar')) {
      setRotation((prev) => (prev + 90) % 360);
      showToast(
        lang === 'id'
          ? `Foto "${currentPhotoName}" diputar 90°. (Pratinjau visual)`
          : `Rotated 90°. (Visual preview)`
      );
    } else if (tool.startsWith('Naikkan')) {
      setHighContrast((prev) => !prev);
      showToast(
        lang === 'id'
          ? `Kontras foto "${currentPhotoName}" disesuaikan untuk inspeksi teks label.`
          : `Contrast adjusted for label inspection.`
      );
    } else if (tool.startsWith('Pangkas')) {
      setIsCropped((prev) => !prev);
      showToast(
        lang === 'id'
          ? `Area fokus objek foto "${currentPhotoName}" disesuaikan.`
          : `Crop focus toggled.`
      );
    } else if (tool.startsWith('Ratakan')) {
      setIsLeveled((prev) => !prev);
      showToast(
        lang === 'id'
          ? `Kemiringan horizon foto "${currentPhotoName}" diratakan secara visual.`
          : `Horizon visual leveling applied.`
      );
    } else if (tool.startsWith('Hapus')) {
      setRemovedBg((prev) => !prev);
      showToast(
        lang === 'id'
          ? `Segmentasi pratinjau latar belakang foto "${currentPhotoName}" diterapkan.`
          : `Background preview segmentation toggled.`
      );
    } else if (tool.startsWith('Tandai')) {
      setMarkedObject((prev) => !prev);
      showToast(
        lang === 'id'
          ? `Area bounding-box objek utama foto "${currentPhotoName}" ditandai.`
          : `Main object bounding box highlighted.`
      );
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
                color: 'var(--sah-copper-dark)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
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
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
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
              gridTemplateColumns: photoList.length === 0 ? '1fr' : 'repeat(auto-fill, minmax(212px, 1fr))',
              gap: 14,
            }}
          >
            {photoList.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  background: 'var(--sah-white)',
                  border: '1.5px dashed var(--sah-line)',
                  borderRadius: 20,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: 'rgba(23,36,58,.04)',
                    border: '1px solid rgba(23,36,58,.08)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--sah-muted)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sah-navy)' }}>
                  {lang === 'id' ? 'Belum ada foto kemasan terdaftar' : 'No packaging photos registered'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--sah-muted)', maxWidth: 420, lineHeight: 1.5 }}>
                  {lang === 'id'
                    ? 'Produk ini belum memiliki foto kemasan referensi. Gunakan tombol "Unggah Foto Baru" di atas untuk menambahkan berkas foto.'
                    : 'This product has no reference packaging photos yet. Use the "Upload New Photo" button above to add photo files.'}
                </div>
              </div>
            ) : (
              photoList.map((p, idx) => {
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
                      height: 160,
                      background: hasUrl
                        ? 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f4f5f8 100%)'
                        : p.gr,
                      display: 'grid',
                      placeItems: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      padding: hasUrl ? '10px 12px' : 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    {hasUrl ? (
                      <img
                        src={p.url}
                        alt={p.f}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 3px 8px rgba(23,36,58,.10))',
                          pointerEvents: 'none',
                        }}
                      />
                    ) : (
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

                    {/* Package side badge top-left */}
                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'rgba(255, 255, 255, 0.92)',
                        color: 'var(--sah-navy)',
                        fontSize: 10,
                        fontWeight: 700,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {packageSideDisplayLabel(p.packageSide, lang)}
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
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Card Metadata */}
                  <div
                    style={{
                      padding: '12px 13px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'var(--sah-navy)',
                      }}
                      title={p.f}
                    >
                      {p.f}
                    </div>

                    <div style={{ fontSize: 10.5, color: 'var(--sah-muted)', lineHeight: 1.35 }}>
                      <div>{p.dim}</div>
                      {p.uploadedAt && (
                        <div style={{ color: '#64748b', marginTop: 2, fontSize: 10 }}>
                          {formatPhotoTimestamp(p.uploadedAt, lang)}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 2 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          background: p.st.bg,
                          border: `1px solid ${p.st.bd}`,
                          color: 'var(--sah-frame)',
                        }}
                      >
                        <span style={{ fontSize: 9, color: p.st.gc }}>{p.st.g}</span>
                        {lang === 'id' ? p.st.id : p.st.en}
                      </span>
                    </div>

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
            })
          )}
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
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: 'var(--sah-navy)',
                  }}
                >
                  Editor foto — {activePhoto?.f ? activePhoto.f : `Foto ${selectedPhotoIndex + 1}`}
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
                  {activePhoto?.dim || activePhoto?.f}
                </span>
              </div>
              
              {/* Informative Sub-header Badge (BUG-07) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: 'var(--sah-copper-dark)',
                    background: 'var(--sah-copper-pale)',
                    padding: '2px 7px',
                    borderRadius: 6,
                  }}
                >
                  {lang === 'id' ? 'Alat Bantu Visual AI' : 'AI Visual Helper'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--sah-muted)' }}>
                  {lang === 'id' ? 'Pratinjau inspeksi pra-indeks' : 'Pre-index inspection preview'}
                </span>
              </div>

              {/* Photo Status & Metadata Strip */}
              {activePhoto && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: 'var(--sah-ivory)',
                    border: '1px solid var(--sah-line)',
                    fontSize: 11,
                    color: 'var(--sah-navy)',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: 'var(--sah-muted)', fontWeight: 500 }}>
                      {lang === 'id' ? 'Sisi Kemasan:' : 'Package Side:'}
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {packageSideDisplayLabel(activePhoto.packageSide, lang)}
                    </span>
                  </div>

                  <div style={{ width: 1, height: 12, background: 'var(--sah-line)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: 'var(--sah-muted)', fontWeight: 500 }}>
                      {lang === 'id' ? 'Status:' : 'Status:'}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontWeight: 700,
                        color: activePhoto.st.gc || 'inherit',
                      }}
                    >
                      <span style={{ fontSize: 8 }}>{activePhoto.st.g}</span>
                      {lang === 'id' ? activePhoto.st.id : activePhoto.st.en}
                    </span>
                  </div>

                  {activePhoto.uploadedAt && (
                    <>
                      <div style={{ width: 1, height: 12, background: 'var(--sah-line)' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: 'var(--sah-muted)', fontWeight: 500 }}>
                          {lang === 'id' ? 'Diunggah:' : 'Uploaded:'}
                        </span>
                        <span style={{ fontWeight: 600, color: '#475569' }}>
                          {formatPhotoTimestamp(activePhoto.uploadedAt, lang)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Workspace / Canvas */}
            <div
              style={{
                height: 220,
                borderRadius: 17,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,.35)',
                background: 'radial-gradient(circle at 50% 50%, #1e2e48 0%, #111a29 100%)',
                display: photoList.length === 0 ? 'grid' : 'block',
                placeItems: photoList.length === 0 ? 'center' : undefined,
              }}
            >
              {photoList.length === 0 ? (
                <div style={{ color: 'rgba(255,253,248,0.5)', fontSize: 12, textAlign: 'center', padding: 16 }}>
                  {lang === 'id'
                    ? 'Belum ada foto yang dipilih untuk inspeksi'
                    : 'No photo selected for inspection'}
                </div>
              ) : (
                <>
                  {/* Inner background & image layer with smooth transform */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 8,
                      background: removedBg
                        ? (activePhoto?.url
                          ? `#ffffff url(${activePhoto.url}) center / contain no-repeat`
                          : '#ffffff')
                        : (activePhoto?.url
                          ? `url(${activePhoto.url}) center / contain no-repeat`
                          : activePhoto?.gr || G1),
                      display: 'grid',
                      placeItems: 'center',
                      filter: highContrast ? 'contrast(135%) brightness(1.05)' : 'none',
                      transform: `rotate(${rotation}deg) scale(${isCropped ? 1.25 : 1}) rotate(${isLeveled ? -2 : 0}deg)`,
                      transformOrigin: 'center center',
                      transition: 'transform .25s ease, filter .2s ease, background .2s ease',
                      borderRadius: 12,
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
                </>
              )}
            </div>

            {/* Tool Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {PHOTO_TOOLS.map((tool) => {
                const isToolActive =
                  (tool.startsWith('Putar') && rotation !== 0) ||
                  (tool.startsWith('Naikkan') && highContrast) ||
                  (tool.startsWith('Pangkas') && isCropped) ||
                  (tool.startsWith('Ratakan') && isLeveled) ||
                  (tool.startsWith('Hapus') && removedBg) ||
                  (tool.startsWith('Tandai') && markedObject);

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
                      color: isReadOnly ? 'var(--sah-muted)' : (isToolActive ? 'var(--sah-frame)' : 'var(--sah-navy)'),
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
                {isReindexing ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                )}
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
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
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
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
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
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
                  Apakah Anda yakin ingin menghapus foto <strong>"{deleteTargetPhoto.f || deleteTargetPhoto.n}"</strong> untuk produk <strong>{prodName}</strong>? Tindakan ini akan mencabut vektor fitur visual dari basis data.
                </>
              ) : (
                <>
                  Are you sure you want to delete photo <strong>"{deleteTargetPhoto.f || deleteTargetPhoto.n}"</strong>?
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                    <span>Menghapus…</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
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
