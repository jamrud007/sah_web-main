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

  // Process files from file input or drag-and-drop with PNG/JPEG & 15MB validation
  const processFiles = (files: File[]) => {
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
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
            ? `Berkas "${file.name}" ditolak. Ukuran berkas melebihi batas 15 MB.`
            : `File "${file.name}" rejected. File size exceeds 15 MB.`
        );
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const hasExistingPrimary = photos.some((p) => p.is_primary);

    validFiles.forEach((file, idx) => {
      const isPrimary = !hasExistingPrimary && idx === 0;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          product_id: existingProduct?.id || 'temp',
          url: dataUrl,
          file_name: file.name,
          angle: 'Depan',
          package_side: 'front',
          dimensions: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          status: 'indexed',
          index_status: 'indexed',
          is_primary: isPrimary,
          created_at: new Date().toISOString(),
        };
        setPhotos((prev) => [...prev, newPhoto]);
        showToast(
          lang === 'id'
            ? `Foto "${file.name}" berhasil ditambahkan.`
            : `Photo "${file.name}" added.`
        );
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      <text x="200" y="288" font-family="'Plus Jakarta Sans', sans-serif" font-size="13.5" font-weight="700" fill="#fffdf8" text-anchor="middle">FOTO · ${cleanProdName.slice(0, 22)}</text>
      <text x="200" y="340" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="rgba(255,253,248,0.6)" text-anchor="middle">2048 × 2048 · SAH VISUAL INDEX</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgData)}`;

    const newPhoto: Photo = {
      id: `photo-sample-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      product_id: existingProduct?.id || 'temp',
      url: dataUrl,
      file_name: `${(name || skuCode).toLowerCase().replace(/[^a-z0-9]/g, '_')}_sample_${photos.length + 1}.jpg`,
      angle: 'Depan',
      package_side: 'front',
      dimensions: '2048 × 2048 · 1.8 MB',
      status: 'indexed',
      index_status: 'indexed',
      is_primary: photos.length === 0,
      created_at: new Date().toISOString(),
    };
    setPhotos((prev) => [...prev, newPhoto]);
    showToast(
      lang === 'id'
        ? 'Contoh foto referensi ditambahkan.'
        : 'Sample reference photo added.'
    );
  };

  const handleRemovePhoto = (photoId: string) => {
    if (isReadOnly) return;
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    showToast(lang === 'id' ? 'Foto referensi dihapus.' : 'Photo removed.');
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
            {/* Header: Title + Dynamic Counter Badge + Quick Sample Button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: 16,
                      color: 'var(--sah-navy)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Foto Referensi Produk
                  </span>
                  {photos.length > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: 'rgba(197,138,99,0.12)',
                        color: 'var(--sah-copper-dark)',
                        fontSize: 11,
                        fontWeight: 700,
                        border: '1px solid rgba(197,138,99,0.25)',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--sah-copper)',
                        }}
                      />
                      {photos.length} foto tersimpan
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--sah-muted)', marginTop: 3 }}>
                  Satu SKU dapat memiliki lebih dari satu foto referensi (AR-03). Disarankan mengunggah foto kemasan dari berbagai sudut (depan, belakang, samping, dan tutup) untuk akurasi pengindeksan visual AI.
                </div>
              </div>

              {/* Controls: Quick Sample Button */}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddSamplePhoto}
                  style={{
                    height: 36,
                    padding: '0 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(197,138,99,0.3)',
                    background: 'linear-gradient(180deg, #ffffff 0%, #faf6f2 100%)',
                    color: 'var(--sah-copper-dark)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    flexShrink: 0,
                    boxShadow: '0 1px 4px rgba(23,36,58,0.04)',
                    transition: 'all .2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--sah-copper)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(197,138,99,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(197,138,99,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(23,36,58,0.04)';
                  }}
                  title="Buat preview kemasan otomatis untuk demo"
                >
                  <span>+ Contoh Kemasan</span>
                </button>
              )}
            </div>

            {/* Dropzone Upload Box with SaaS Icon Bubble & Specs Chips */}
            <div
              onClick={() => !isReadOnly && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                minHeight: 154,
                padding: '24px 20px',
                border: isDragging
                  ? '2px dashed var(--sah-copper-dark)'
                  : '1.5px dashed rgba(197, 138, 99, 0.45)',
                borderRadius: 20,
                background: isDragging
                  ? 'linear-gradient(180deg, #fdf8f4 0%, #f6e8dd 100%)'
                  : (isReadOnly
                      ? 'rgba(23,36,58,.03)'
                      : 'linear-gradient(180deg, #ffffff 0%, rgba(248, 244, 239, 0.65) 100%)'),
                boxShadow: isDragging
                  ? '0 0 0 4px rgba(197,138,99,0.18), 0 8px 24px -4px rgba(197,138,99,0.25)'
                  : '0 2px 10px rgba(23,36,58,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isDragging ? 'scale(1.01)' : 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (!isReadOnly && !isDragging) {
                  e.currentTarget.style.borderColor = 'var(--sah-copper)';
                  e.currentTarget.style.background = 'linear-gradient(180deg, #ffffff 0%, rgba(243, 234, 225, 0.75) 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(197,138,99,0.12)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isReadOnly && !isDragging) {
                  e.currentTarget.style.borderColor = 'rgba(197, 138, 99, 0.45)';
                  e.currentTarget.style.background = 'linear-gradient(180deg, #ffffff 0%, rgba(248, 244, 239, 0.65) 100%)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(23,36,58,0.02)';
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

              {/* Centered Glowing Icon Bubble */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: isDragging
                    ? 'var(--sah-copper)'
                    : 'linear-gradient(135deg, #fefdfb 0%, #f4e7dc 100%)',
                  border: isDragging
                    ? '2px solid #fff'
                    : '1.5px solid rgba(197,138,99,0.35)',
                  boxShadow: isDragging
                    ? '0 4px 14px rgba(197,138,99,0.4)'
                    : '0 4px 12px rgba(197,138,99,0.15)',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'all .2s ease',
                  transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isDragging ? '#ffffff' : 'var(--sah-copper-dark)'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              {/* Text & Interactive CTA */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 5, maxWidth: 500 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: isReadOnly ? 'var(--sah-muted)' : 'var(--sah-navy)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {isReadOnly ? (
                    'Pengunggahan foto dinonaktifkan untuk peran ini'
                  ) : isDragging ? (
                    <span style={{ color: 'var(--sah-copper-dark)' }}>
                      Lepaskan berkas foto di sini untuk mengunggah...
                    </span>
                  ) : (
                    <>
                      Tarik & lepas foto kemasan ke sini, atau{' '}
                      <span
                        style={{
                          color: 'var(--sah-copper-dark)',
                          textDecoration: 'underline',
                          textUnderlineOffset: 3,
                          cursor: 'pointer',
                        }}
                      >
                        pilih berkas
                      </span>
                    </>
                  )}
                </div>
                {!isReadOnly && !isDragging && (
                  <div style={{ fontSize: 12, color: 'var(--sah-muted)', lineHeight: 1.4 }}>
                    Contoh: foto tampak depan, belakang, sisi kiri/kanan, atau tutup kemasan
                  </div>
                )}
              </div>

              {/* Feature/Format Pill Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: 'rgba(23,36,58,0.04)',
                    border: '1px solid rgba(23,36,58,0.07)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sah-muted)',
                  }}
                >
                  PNG, JPG, WEBP
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: 'rgba(23,36,58,0.04)',
                    border: '1px solid rgba(23,36,58,0.07)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sah-muted)',
                  }}
                >
                  Maks. 15 MB / foto
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: 'rgba(23,36,58,0.04)',
                    border: '1px solid rgba(23,36,58,0.07)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sah-muted)',
                  }}
                >
                  Multi-upload didukung
                </span>
              </div>
            </div>

            {/* Photos Preview Grid (3-column layout with wrapping) */}
            {photos.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 14,
                  marginTop: 6,
                }}
              >
                {photos.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      border: '1px solid var(--sah-line)',
                      borderRadius: 18,
                      overflow: 'hidden',
                      background: 'var(--sah-white)',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(23,36,58,.04)',
                      transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isReadOnly) {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(23,36,58,.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isReadOnly) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(23,36,58,.04)';
                      }
                    }}
                  >
                    <div
                      style={{
                        height: 120,
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
                            fontSize: 18,
                            color: 'rgba(255,253,248,.8)',
                          }}
                        >
                          IMG
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'var(--sah-navy)',
                          }}
                          title={p.file_name}
                        >
                          {p.file_name}
                        </div>
                        {p.dimensions && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: 'var(--sah-muted)',
                              flexShrink: 0,
                            }}
                          >
                            {p.dimensions.split('·')[1]?.trim() || p.dimensions}
                          </span>
                        )}
                      </div>

                      {!isReadOnly && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(p.id)}
                            style={{
                              height: 28,
                              padding: '0 12px',
                              borderRadius: 9,
                              border: '1px solid rgba(197,75,60,.2)',
                              background: 'rgba(197,75,60,.06)',
                              color: '#c54b3c',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all .15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(197,75,60,.14)';
                              e.currentTarget.style.borderColor = '#c54b3c';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(197,75,60,.06)';
                              e.currentTarget.style.borderColor = 'rgba(197,75,60,.2)';
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Hapus</span>
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
