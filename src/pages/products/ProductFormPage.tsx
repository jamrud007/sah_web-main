// src/pages/products/ProductFormPage.tsx
// Exact 1:1 SCR-WEB-04 (Form SKU) from SAH Web Admin (standalone).html
// Includes Section 3: Inline Photo Upload (Gambar 2 requirement)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { createProduct, updateProduct } from '../../store/productSlice';
import { useSahToast } from '../../context/ToastContext';
import type { Product, Photo, HalalStatus } from '../../types/apiDef';
import type { SahRole } from '../../store/authSlice';
import { normalizePackageSide } from '../../services/photoService';

const CATEGORIES = [
  'Bumbu & saus',
  'Makanan instan',
  'Minuman',
  'Roti & kue',
  'Susu & olahan',
  'Minyak & mentega',
  'Biskuit & camilan',
];

const ISSUERS = ['BPJPH', 'MUI (legacy)', 'Otoritas halal negara setempat'];

const HALAL_STATUS_OPTIONS = [
  { value: 'halal', label: 'Halal terverifikasi' },
  { value: 'pending', label: 'Menunggu pembaruan sertifikat' },
  { value: 'non_halal', label: 'Tidak bersertifikat' },
];

const ANGLES = ['Depan', 'Belakang', 'Sisi kiri', 'Sisi kanan', 'Tutup', 'Kemasan isi ulang'];

const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { showToast, lang } = useSahToast();

  const userInfo = useAppSelector((s) => s.auth.userInfo);
  const currentSahRole: SahRole =
    userInfo?.role === 'administrator'
      ? 'US-04'
      : (userInfo?.email?.includes('lestari') ? 'US-05' : 'US-02');
  const isReadOnly = currentSahRole === 'US-04';

  const products = useAppSelector((s) => s.products.items);
  const existingProduct = id
    ? products.find((p: Product) => p.id === id || p.sku_code === id)
    : null;
  const isEditing = Boolean(existingProduct);

  // Form states
  const [skuCode, setSkuCode] = useState(
    existingProduct?.sku_code || `SKU-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [name, setName] = useState(existingProduct?.name || '');
  const [manufacturer, setManufacturer] = useState(existingProduct?.manufacturer || '');
  const [category, setCategory] = useState(existingProduct?.category || 'Bumbu & saus');
  const [brand, setBrand] = useState(existingProduct?.brand || '');
  const [description, setDescription] = useState(
    existingProduct?.description || (isEditing ? '' : 'Kemasan botol plastik, terdaftar pada sistem Sahabat Halal.')
  );

  // Halal certificate states — resolve from API array or mock singular
  const existingCert = existingProduct?.halal_certificates?.[0] ?? existingProduct?.halal_certificate ?? null;

  const [certNo, setCertNo] = useState(
    existingCert?.certificate_no || (isEditing ? '' : 'ID00410000123456790125')
  );
  const [issuer, setIssuer] = useState(
    existingCert?.issuer || 'BPJPH'
  );
  const [issuedDate, setIssuedDate] = useState(
    existingCert?.issued_date || (isEditing ? '' : '2026-01-12')
  );
  const [validUntil, setValidUntil] = useState(
    existingCert?.valid_until || (isEditing ? '' : '2030-01-11')
  );
  const [halalStatus, setHalalStatus] = useState<HalalStatus>(
    existingProduct?.halal_status || 'halal'
  );
  const [autoIndex, setAutoIndex] = useState(true);

  // Inline Photos (Gambar 2 requirement)
  const [photos, setPhotos] = useState<Photo[]>(existingProduct?.photos || []);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingProduct) {
      setSkuCode(existingProduct.sku_code);
      setName(existingProduct.name);
      setManufacturer(existingProduct.manufacturer || '');
      setCategory(existingProduct.category || 'Bumbu & saus');
      setBrand(existingProduct.brand || '');
      setDescription(existingProduct.description || '');
      const cert = existingProduct.halal_certificates?.[0] ?? existingProduct.halal_certificate ?? null;
      if (cert) {
        setCertNo(cert.certificate_no || '');
        setIssuer(cert.issuer || 'BPJPH');
        setIssuedDate(cert.issued_date || '');
        setValidUntil(cert.valid_until || '');
      }
      setHalalStatus(existingProduct.halal_status);
      setPhotos(existingProduct.photos || []);
    }
  }, [existingProduct]);

  // Process files from file input or drag-and-drop with PNG/JPEG & 5MB validation
  const processFiles = (files: File[]) => {
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        showToast(
          lang === 'id'
            ? `Berkas "${file.name}" ditolak. Format harus PNG atau JPEG.`
            : `File "${file.name}" rejected. Format must be PNG or JPEG.`
        );
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast(
          lang === 'id'
            ? `Berkas "${file.name}" ditolak. Ukuran berkas melebihi batas 5 MB.`
            : `File "${file.name}" rejected. File size exceeds 5 MB.`
        );
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const hasExistingPrimary = photos.some((p) => p.is_primary);

    validFiles.forEach((file, idx) => {
      const assignedAngle = ANGLES[(photos.length + idx) % ANGLES.length];
      const isPrimary = !hasExistingPrimary && idx === 0;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          product_id: existingProduct?.id || 'temp',
          url: dataUrl,
          file_name: file.name,
          angle: assignedAngle,
          package_side: normalizePackageSide(assignedAngle),
          dimensions: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          status: 'indexed',
          index_status: 'indexed',
          is_primary: isPrimary,
          created_at: new Date().toISOString(),
        };
        setPhotos((prev) => [...prev, newPhoto]);
        showToast(
          lang === 'id'
            ? `Foto "${file.name}" (${assignedAngle}) berhasil ditambahkan.`
            : `Photo "${file.name}" (${assignedAngle}) added.`
        );
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdatePhotoAngle = (photoId: string, newAngle: string) => {
    if (isReadOnly) return;
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? {
              ...p,
              angle: newAngle,
              package_side: normalizePackageSide(newAngle),
            }
          : p
      )
    );
    showToast(
      lang === 'id'
        ? `Sudut foto diubah ke "${newAngle}".`
        : `Photo angle changed to "${newAngle}".`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const files = e.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isReadOnly) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isReadOnly) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  // Add instant realistic mock photo (convenience for demo / testing)
  const handleAddSamplePhoto = () => {
    if (isReadOnly) return;
    const nextAngle = ANGLES[photos.length % ANGLES.length];
    const cleanProdName = name.trim() || 'Produk Halal';
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1b2838"/>
          <stop offset="60%" stop-color="#23364f"/>
          <stop offset="100%" stop-color="#c58a63"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="32" fill="url(#bg)"/>
      <circle cx="200" cy="160" r="64" fill="rgba(255,253,248,0.08)" stroke="#c58a63" stroke-width="2.5"/>
      <text x="200" y="155" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" fill="#fffdf8" text-anchor="middle">HALAL</text>
      <text x="200" y="185" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#c58a63" text-anchor="middle">BPJPH INDONESIA</text>
      <rect x="50" y="260" width="300" height="44" rx="12" fill="rgba(255,253,248,0.12)"/>
      <text x="200" y="288" font-family="'Plus Jakarta Sans', sans-serif" font-size="13.5" font-weight="700" fill="#fffdf8" text-anchor="middle">${nextAngle.toUpperCase()} · ${cleanProdName.slice(0, 22)}</text>
      <text x="200" y="340" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="rgba(255,253,248,0.6)" text-anchor="middle">2048 × 2048 · SAH VISUAL INDEX</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgData)}`;

    const newPhoto: Photo = {
      id: `photo-sample-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      product_id: existingProduct?.id || 'temp',
      url: dataUrl,
      file_name: `${(name || skuCode).toLowerCase().replace(/[^a-z0-9]/g, '_')}_${nextAngle.toLowerCase().replace(/\s+/g, '_')}.jpg`,
      angle: nextAngle,
      package_side: normalizePackageSide(nextAngle),
      dimensions: '2048 × 2048 · 1.8 MB',
      status: 'indexed',
      index_status: 'indexed',
      is_primary: photos.length === 0,
      created_at: new Date().toISOString(),
    };
    setPhotos((prev) => [...prev, newPhoto]);
    showToast(
      lang === 'id'
        ? `Contoh foto sudut "${nextAngle}" ditambahkan.`
        : `Sample photo (${nextAngle}) added.`
    );
  };

  const handleRemovePhoto = (photoId: string) => {
    if (isReadOnly) return;
    setPhotos((prev) => {
      const remaining = prev.filter((p) => p.id !== photoId);
      if (remaining.length > 0 && !remaining.some((p) => p.is_primary)) {
        remaining[0].is_primary = true;
      }
      return remaining;
    });
    showToast(lang === 'id' ? 'Foto referensi dihapus.' : 'Photo removed.');
  };

  const handleSetPrimaryPhoto = (photoId: string) => {
    if (isReadOnly) return;
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        is_primary: p.id === photoId,
      }))
    );
    showToast(lang === 'id' ? 'Foto utama ditetapkan.' : 'Primary photo set.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      showToast(
        lang === 'id'
          ? 'Peran US-04 hanya memiliki hak baca. Aksi pengubahan dinonaktifkan.'
          : 'Role US-04 has read-only access. Modification actions are disabled.'
      );
      return;
    }

    if (!skuCode.trim() || !name.trim() || !manufacturer.trim()) {
      showToast(
        lang === 'id'
          ? 'Harap lengkapi field wajib (*).'
          : 'Please complete required fields (*).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const productPayload: Partial<Product> = {
        sku_code: skuCode.trim(),
        name: name.trim(),
        manufacturer: manufacturer.trim(),
        category: category,
        brand: brand.trim() || name.split(' ')[0],
        description: description,
        halal_status: halalStatus,
        index_status: autoIndex ? (photos.length > 0 ? 'indexed' : 'pending') : 'pending',
        halal_certificate: {
          certificate_no: certNo.trim(),
          issuer: issuer,
          issued_date: issuedDate,
          valid_until: validUntil,
        },
        photos: photos,
      };

      if (isEditing && existingProduct) {
        await dispatch(
          updateProduct({ id: existingProduct.id, payload: productPayload as any })
        ).unwrap();
        showToast(
          lang === 'id'
            ? 'Perubahan disimpan. Jejak audit dicatat (ENT-29).'
            : 'Changes saved. Audit trail recorded (ENT-29).'
        );
      } else {
        await dispatch(createProduct(productPayload as any)).unwrap();
        showToast(
          lang === 'id'
            ? 'SKU berhasil didaftarkan. Jejak audit dicatat (ENT-29).'
            : 'SKU successfully registered. Audit trail recorded (ENT-29).'
        );
      }

      navigate('/produk');
    } catch {
      showToast(
        lang === 'id' ? 'Gagal menyimpan produk.' : 'Failed to save product.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
          {/* Section 1: Identitas produk */}
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
            <div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 15.5,
                  color: 'var(--sah-navy)',
                }}
              >
                Identitas produk
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sah-muted)' }}>
                Satu SKU dapat memiliki lebih dari satu foto referensi (AR-03).
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 14,
              }}
            >
              {/* Kode SKU */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Kode SKU <span style={{ color: 'var(--sah-copper-dark)' }}>*</span>
                </span>
                <input
                  value={skuCode}
                  onChange={(e) => setSkuCode(e.target.value)}
                  placeholder="SKU-100241"
                  required
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </label>

              {/* Nama produk */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Nama produk <span style={{ color: 'var(--sah-copper-dark)' }}>*</span>
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kecap Manis Bango 275 ml"
                  required
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </label>

              {/* Produsen */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Produsen <span style={{ color: 'var(--sah-copper-dark)' }}>*</span>
                </span>
                <input
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="Unilever Indonesia"
                  required
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </label>

              {/* Kategori */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Kategori
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 12px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'pointer',
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              {/* Brand */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Brand
                </span>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Bango"
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </label>

              {/* Deskripsi ringkas */}
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  gridColumn: 'span 2',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Deskripsi ringkas
                </span>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kecap manis kental berbahan kedelai hitam, kemasan botol plastik 275 ml."
                  disabled={isReadOnly}
                  style={{
                    padding: '11px 14px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    resize: 'vertical',
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </label>
            </div>
          </div>

          {/* Section 2: Sertifikat halal */}
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
            <div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 15.5,
                  color: 'var(--sah-navy)',
                }}
              >
                Sertifikat halal
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sah-muted)' }}>
                Status terverifikasi hanya boleh ditetapkan bila nomor sertifikat terisi.
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 14,
              }}
            >
              {/* Nomor sertifikat */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Nomor sertifikat <span style={{ color: 'var(--sah-copper-dark)' }}>*</span>
                </span>
                <input
                  value={certNo}
                  onChange={(e) => setCertNo(e.target.value)}
                  placeholder="ID00410000123456790125"
                  required
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </label>

              {/* Penerbit */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Penerbit
                </span>
                <select
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 12px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'pointer',
                  }}
                >
                  {ISSUERS.map((iss) => (
                    <option key={iss} value={iss}>
                      {iss}
                    </option>
                  ))}
                </select>
              </label>

              {/* Tanggal terbit */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Tanggal terbit
                </span>
                <input
                  type="date"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </label>

              {/* Masa berlaku sampai */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Masa berlaku sampai
                </span>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </label>

              {/* Status halal */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Status halal
                </span>
                <select
                  value={halalStatus}
                  onChange={(e) => setHalalStatus(e.target.value as any)}
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 12px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'pointer',
                  }}
                >
                  {HALAL_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Status indeks visual toggle */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                  Status indeks visual
                </span>
                <div
                  onClick={() => !isReadOnly && setAutoIndex(!autoIndex)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    height: 44,
                    padding: '0 14px',
                    border: '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)',
                    cursor: isReadOnly ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 999,
                      background: autoIndex ? 'var(--sah-copper)' : 'rgba(23,36,58,.16)',
                      position: 'relative',
                      flex: 'none',
                      transition: 'background .15s ease',
                      opacity: isReadOnly ? 0.6 : 1,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: autoIndex ? 21 : 3,
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        background: 'var(--sah-white)',
                        transition: 'left .15s ease',
                      }}
                    />
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--sah-navy)',
                    }}
                  >
                    {autoIndex
                      ? 'Diindeks otomatis setelah foto diunggah'
                      : 'Indeks manual'}
                  </span>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--sah-muted)' }}>
                  Penambahan SKU tidak memerlukan pelatihan ulang model (AR-01).
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Inline Foto Referensi (Gambar 2 requirement) */}
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
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 15.5,
                    color: 'var(--sah-navy)',
                  }}
                >
                  Foto referensi produk (Upload Gambar 2)
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--sah-muted)' }}>
                  Satu SKU dapat memiliki lebih dari satu foto referensi (AR-03). Unggah foto kemasan untuk pengindeksan visual.
                </div>
              </div>

              {/* Controls: Quick Sample Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleAddSamplePhoto}
                    style={{
                      height: 34,
                      padding: '0 12px',
                      borderRadius: 11,
                      border: '1px solid var(--sah-line)',
                      background: 'var(--sah-white)',
                      color: 'var(--sah-copper-dark)',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    title="Buat preview kemasan otomatis untuk demo"
                  >
                    <span>+ Contoh Kemasan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dropzone Upload Box with Drag & Drop */}
            <div
              onClick={() => !isReadOnly && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                height: 120,
                border: isDragging
                  ? '2px dashed var(--sah-copper-dark)'
                  : '1.5px dashed var(--sah-copper)',
                borderRadius: 16,
                background: isDragging
                  ? '#ebd9cb'
                  : (isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-copper-pale)'),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: 'var(--sah-frame)',
                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                transition: 'all .15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isReadOnly && !isDragging) {
                  e.currentTarget.style.background = '#e8d2c2';
                }
              }}
              onMouseLeave={(e) => {
                if (!isReadOnly && !isDragging) {
                  e.currentTarget.style.background = 'var(--sah-copper-pale)';
                }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                disabled={isReadOnly}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--sah-copper-dark)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                </svg>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isReadOnly ? 'var(--sah-muted)' : 'var(--sah-copper-dark)',
                  }}
                >
                  {isReadOnly
                    ? 'Pengunggahan foto dinonaktifkan untuk peran ini'
                    : '+ Unggah materi gambar'}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--sah-muted)' }}>
                {isReadOnly
                  ? 'Peran US-04 hanya memiliki hak baca modul ini.'
                  : 'Klik untuk memilih berkas atau seret & lepas berkas PNG / JPEG (Maks. 5 MB)'}
              </span>
            </div>

            {/* Photos Preview Grid (3-column layout with wrapping) */}
            {photos.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 12,
                  marginTop: 4,
                }}
              >
                {photos.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      border: p.is_primary
                        ? '1.5px solid var(--sah-copper)'
                        : '1px solid var(--sah-line)',
                      borderRadius: 16,
                      overflow: 'hidden',
                      background: 'var(--sah-ivory)',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: p.is_primary ? '0 2px 8px rgba(197,138,99,.18)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        height: 110,
                        background: p.url
                          ? `url(${p.url}) center / cover no-repeat`
                          : 'linear-gradient(145deg,#477fa2,#25384a 58%,#6f3f32)',
                        display: 'grid',
                        placeItems: 'center',
                        position: 'relative',
                      }}
                    >
                      {!p.url && (
                        <span
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: 20,
                            color: 'rgba(255,253,248,.9)',
                          }}
                        >
                          {p.angle ? p.angle.slice(0, 2).toUpperCase() : 'FT'}
                        </span>
                      )}

                      {/* Compact Angle Selector positioned directly on the image */}
                      <select
                        value={p.angle || 'Depan'}
                        onChange={(e) => handleUpdatePhotoAngle(p.id, e.target.value)}
                        disabled={isReadOnly}
                        style={{
                          position: 'absolute',
                          left: 8,
                          top: 8,
                          height: 24,
                          padding: '0 18px 0 8px',
                          borderRadius: 999,
                          background: 'rgba(255,253,248,0.95)',
                          backdropFilter: 'blur(4px)',
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: 'var(--sah-navy)',
                          boxShadow: '0 1px 4px rgba(0,0,0,.15)',
                          border: '1px solid rgba(23,36,58,.15)',
                          outline: 'none',
                          cursor: isReadOnly ? 'not-allowed' : 'pointer',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'%3E%3Cpath fill='%2317243a' d='M0 0l4 5 4-5z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 6px center',
                          zIndex: 2,
                        }}
                        title="Pilih sudut untuk foto ini"
                      >
                        {ANGLES.map((ang) => (
                          <option key={ang} value={ang}>
                            {ang}
                          </option>
                        ))}
                      </select>

                      {p.is_primary && (
                        <span
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            padding: '3px 8px',
                            borderRadius: 999,
                            background: 'var(--sah-copper)',
                            color: 'var(--sah-white)',
                            fontSize: 9.5,
                            fontWeight: 800,
                            boxShadow: '0 1px 4px rgba(0,0,0,.15)',
                            zIndex: 2,
                          }}
                        >
                          ★ Utama
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--sah-navy)',
                        }}
                        title={p.file_name}
                      >
                        {p.file_name}
                      </div>

                      {/* Compact Angle Selector positioned directly under the image */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sah-muted)' }}>
                          Sudut:
                        </span>
                        <select
                          value={p.angle || 'Depan'}
                          onChange={(e) => handleUpdatePhotoAngle(p.id, e.target.value)}
                          disabled={isReadOnly}
                          style={{
                            flex: 1,
                            height: 26,
                            borderRadius: 8,
                            border: '1px solid var(--sah-line)',
                            background: 'var(--sah-white)',
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--sah-navy)',
                            padding: '0 6px',
                            outline: 'none',
                            cursor: isReadOnly ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {ANGLES.map((ang) => (
                            <option key={ang} value={ang}>
                              {ang}
                            </option>
                          ))}
                        </select>
                      </div>

                      {!isReadOnly && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          {!p.is_primary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryPhoto(p.id)}
                              style={{
                                flex: 1,
                                height: 26,
                                borderRadius: 8,
                                border: '1px solid var(--sah-line)',
                                background: 'var(--sah-white)',
                                fontSize: 10.5,
                                fontWeight: 600,
                                color: 'var(--sah-navy)',
                                cursor: 'pointer',
                              }}
                            >
                              Jadikan Utama
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(p.id)}
                            style={{
                              height: 26,
                              padding: '0 8px',
                              borderRadius: 8,
                              border: '1px solid var(--sah-line)',
                              background: 'rgba(168,95,79,.08)',
                              color: 'var(--danger)',
                              fontSize: 10.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: STICKY ACTION PANEL ────────────────── */}
        <div
          style={{
            position: 'sticky',
            top: 88,
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
            Tindakan
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--sah-muted)',
              lineHeight: 1.45,
            }}
          >
            Nomor sertifikat dan masa berlaku dimasukkan sebagaimana adanya (OS-03). Perubahan status halal dicatat pada jejak audit ENT-29.
          </div>

          {/* Simpan Button */}
          <button
            type="submit"
            disabled={isSubmitting || isReadOnly}
            style={{
              height: 46,
              border: 0,
              borderRadius: 16,
              background: isReadOnly ? 'rgba(197, 138, 99, 0.35)' : 'var(--sah-copper)',
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
              opacity: isReadOnly ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isReadOnly && !isSubmitting) {
                e.currentTarget.style.background = 'var(--sah-copper-pressed)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isReadOnly && !isSubmitting) {
                e.currentTarget.style.background = 'var(--sah-copper)';
              }
            }}
          >
            <span>{isSubmitting ? 'Menyimpan…' : 'Simpan'}</span>
            <span>→</span>
          </button>

          {/* Batal Button */}
          <button
            type="button"
            onClick={() => navigate('/produk')}
            style={{
              height: 42,
              border: '1px solid var(--sah-line)',
              borderRadius: 15,
              background: 'var(--sah-white)',
              color: 'var(--sah-navy)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              textAlign: 'left',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'border-color .15s ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = 'var(--sah-copper)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = 'var(--sah-line)')
            }
          >
            Batal
          </button>

          <div style={{ height: 1, background: 'var(--sah-line)', margin: '4px 0' }} />

          {/* Metadata Specifications */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              fontSize: 12,
            }}
          >
            <span style={{ color: 'var(--sah-muted)' }}>Entitas</span>
            <span
              style={{
                fontWeight: 600,
                textAlign: 'right',
                color: 'var(--sah-navy)',
              }}
            >
              ENT-05, ENT-08
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              fontSize: 12,
            }}
          >
            <span style={{ color: 'var(--sah-muted)' }}>API</span>
            <span
              style={{
                fontWeight: 600,
                textAlign: 'right',
                color: 'var(--sah-navy)',
              }}
            >
              API-016, API-017
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              fontSize: 12,
            }}
          >
            <span style={{ color: 'var(--sah-muted)' }}>FR</span>
            <span
              style={{
                fontWeight: 600,
                textAlign: 'right',
                color: 'var(--sah-navy)',
              }}
            >
              FR-CAT-02, -04
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductFormPage;
