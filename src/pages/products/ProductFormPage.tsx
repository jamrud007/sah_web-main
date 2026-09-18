// src/pages/products/ProductFormPage.tsx
// Exact 1:1 SCR-WEB-04 (Form SKU) from SAH Web Admin (standalone).html
// Includes Section 3: Inline Photo Upload (Gambar 2 requirement)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  createProduct,
  updateProduct,
  fetchProductById,
  uploadPhoto,
} from '../../store/productSlice';
import { useSahToast } from '../../context/ToastContext';
import type { Product, Photo, HalalStatus, BackendPhotoPackageSide } from '../../types/apiDef';
import { checkIsReadOnly } from '../../store/authSlice';
import {
  packageSideDisplayLabel,
  formatPhotoTimestamp,
  getExtractionStatusConfig,
  formatPhotoFileName,
  buildPhotoUrl,
} from '../../services/photoService';

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
  { value: 'not_halal', label: 'Tidak bersertifikat' },
];

const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { showToast, lang } = useSahToast();

  const userInfo = useAppSelector((s) => s.auth.userInfo);
  const isReadOnly = checkIsReadOnly(userInfo);

  const products = useAppSelector((s) => s.products.items);
  const photosByProductId = useAppSelector((s) => s.products.photosByProductId);
  const selectedProduct = useAppSelector((s) => s.products.selectedProduct);
  const existingProduct = id
    ? ((selectedProduct && (selectedProduct.id === id || selectedProduct.sku_code === id))
        ? selectedProduct
        : products.find((p: Product) => p.id === id || p.sku_code === id) || null)
    : null;
  const isEditing = Boolean(id);

  // Always fetch full product data with photos when editing
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

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
    existingCert?.certificate_no || ''
  );
  const [issuer, setIssuer] = useState(
    existingCert?.issuer || 'BPJPH'
  );
  const [issuedDate, setIssuedDate] = useState(
    existingCert?.issued_date || ''
  );
  const [validUntil, setValidUntil] = useState(
    existingCert?.valid_until || ''
  );
  const [halalStatus, setHalalStatus] = useState<HalalStatus>(
    existingProduct?.halal_status || 'halal'
  );
  const [autoIndex, setAutoIndex] = useState(true);

  // Inline Photos (Gambar 2 requirement)
  interface PendingPhotoUpload {
    tempId: string;
    file: File;
    packageSide: BackendPhotoPackageSide;
  }
  const [photos, setPhotos] = useState<Photo[]>(existingProduct?.photos || []);
  const [pendingFiles, setPendingFiles] = useState<PendingPhotoUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Duplicate Conflict Modal State (ERR-4002)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateConflictInfo, setDuplicateConflictInfo] = useState<{
    skuCode: string;
    certNo: string;
    message: string;
  } | null>(null);

  const handleAutoResolveDuplicate = () => {
    const newSku = `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
    setSkuCode(newSku);
    setDuplicateModalOpen(false);
    showToast(
      lang === 'id'
        ? 'Kode SKU diperbarui dengan nomor unik baru. Silakan klik Simpan kembali.'
        : 'SKU Code updated with unique value. Please click Save again.'
    );
  };

  // Sync form state on route param / product change, and cleanly RESET when adding new SKU
  useEffect(() => {
    if (id && existingProduct) {
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
      const initialPhotos: Photo[] = (() => {
        if (existingProduct.photos && existingProduct.photos.length > 0) return existingProduct.photos;
        if (photosByProductId[existingProduct.id] && photosByProductId[existingProduct.id].length > 0) {
          return photosByProductId[existingProduct.id];
        }
        if (existingProduct.primary_image_path) {
          return [{
            id: `primary-${existingProduct.id}`,
            product_id: existingProduct.id,
            url: buildPhotoUrl(existingProduct.primary_image_path),
            image_path: existingProduct.primary_image_path,
            is_primary: true,
            package_side: 'front',
            angle: 'Depan',
            status: 'indexed' as const,
            index_status: 'indexed' as const,
            extraction_status: 'extracted',
            file_name: 'front.jpg',
          }];
        }
        return [];
      })();
      setPhotos(initialPhotos);
      setPendingFiles([]);
    } else if (!id) {
      // Clean reset for new SKU so old values are never "cached" across route changes
      setSkuCode(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
      setName('');
      setManufacturer('');
      setCategory('Bumbu & saus');
      setBrand('');
      setDescription('Kemasan botol plastik, terdaftar pada sistem Sahabat Halal.');
      setCertNo('');
      setIssuer('BPJPH');
      setIssuedDate('');
      setValidUntil('');
      setHalalStatus('halal');
      setPhotos([]);
      setPendingFiles([]);
    }
  }, [id, existingProduct]);

  // Photos and Monogram helper
  const attachedPhotos: Photo[] = (() => {
    if (existingProduct?.photos && existingProduct.photos.length > 0) return existingProduct.photos;
    if (existingProduct && photosByProductId[existingProduct.id]?.length > 0) return photosByProductId[existingProduct.id];
    if (existingProduct?.primary_image_path) {
      return [{
        id: `primary-${existingProduct.id}`,
        product_id: existingProduct.id,
        url: buildPhotoUrl(existingProduct.primary_image_path),
        image_path: existingProduct.primary_image_path,
        is_primary: true,
        package_side: 'front',
        angle: 'Depan',
        status: 'indexed' as const,
        index_status: 'indexed' as const,
        extraction_status: 'extracted',
        file_name: 'front.jpg',
      }];
    }
    return [];
  })();

  const primaryPhoto =
    photos.find((p) => p.is_primary) ||
    photos[0] ||
    attachedPhotos.find((p) => p.is_primary) ||
    attachedPhotos[0];

  const initialLetters = (name || existingProduct?.name || 'SK')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase() || 'SK';

  // Section anchor tab state
  const [activeSection, setActiveSection] = useState<'identity' | 'halal' | 'photos'>('identity');
  const scrollToSection = (sectionId: string, tab: 'identity' | 'halal' | 'photos') => {
    setActiveSection(tab);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Check changed fields in Edit Mode
  const isSkuChanged = Boolean(isEditing && existingProduct && skuCode !== existingProduct.sku_code);
  const isNameChanged = Boolean(isEditing && existingProduct && name !== existingProduct.name);
  const isManufacturerChanged = Boolean(isEditing && existingProduct && manufacturer !== (existingProduct.manufacturer || ''));
  const isCategoryChanged = Boolean(isEditing && existingProduct && category !== (existingProduct.category || 'Bumbu & saus'));
  const isBrandChanged = Boolean(isEditing && existingProduct && brand !== (existingProduct.brand || ''));
  const isDescriptionChanged = Boolean(isEditing && existingProduct && description !== (existingProduct.description || ''));
  const isCertNoChanged = Boolean(isEditing && existingProduct && certNo !== (existingCert?.certificate_no || ''));
  const isIssuerChanged = Boolean(isEditing && existingProduct && issuer !== (existingCert?.issuer || 'BPJPH'));
  const isIssuedDateChanged = Boolean(isEditing && existingProduct && issuedDate !== (existingCert?.issued_date || ''));
  const isValidUntilChanged = Boolean(isEditing && existingProduct && validUntil !== (existingCert?.valid_until || ''));
  const isHalalStatusChanged = Boolean(isEditing && existingProduct && halalStatus !== existingProduct.halal_status);
  const isPhotosChanged = Boolean(isEditing && existingProduct && photos.length !== (existingProduct.photos?.length || 0));

  const changedFieldsCount = [
    isSkuChanged,
    isNameChanged,
    isManufacturerChanged,
    isCategoryChanged,
    isBrandChanged,
    isDescriptionChanged,
    isCertNoChanged,
    isIssuerChanged,
    isIssuedDateChanged,
    isValidUntilChanged,
    isHalalStatusChanged,
    isPhotosChanged,
  ].filter(Boolean).length;

  const handleResetForm = () => {
    if (!existingProduct) return;
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
    showToast(lang === 'id' ? 'Formulir dikembalikan ke nilai semula.' : 'Form reset to original values.');
  };

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

    const newPhotos: Photo[] = [];
    const newPending: PendingPhotoUpload[] = [];

    validFiles.forEach((file, idx) => {
      const isPrimary = !hasExistingPrimary && photos.length === 0 && idx === 0;
      const photoNum = photos.length + idx + 1;
      const indexStr = String(photoNum).padStart(2, '0');
      const imageName = `image ${indexStr}`;
      const assignedSide: BackendPhotoPackageSide = isPrimary ? 'front' : 'other';
      const tempId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const objectUrl = URL.createObjectURL(file);

      newPhotos.push({
        id: tempId,
        product_id: existingProduct?.id || 'temp',
        url: objectUrl,
        file_name: imageName,
        angle: imageName,
        package_side: assignedSide,
        dimensions: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'pending',
        index_status: 'pending',
        extraction_status: 'pending',
        uploaded_at: new Date().toISOString(),
        is_primary: isPrimary,
        created_at: new Date().toISOString(),
      });

      newPending.push({
        tempId,
        file,
        packageSide: assignedSide,
      });
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
    setPendingFiles((prev) => [...prev, ...newPending]);
    showToast(
      lang === 'id'
        ? `${validFiles.length} foto ditambahkan ke daftar antrean simpan.`
        : `${validFiles.length} photo(s) queued for upload.`
    );

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

  // Add instant realistic sample photo for testing / user convenience
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

    const sampleIndexStr = String(photos.length + 1).padStart(2, '0');
    const sampleName = `image ${sampleIndexStr}`;
    const newPhoto: Photo = {
      id: `photo-sample-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      product_id: existingProduct?.id || 'temp',
      url: dataUrl,
      file_name: sampleName,
      angle: sampleName,
      package_side: photos.length === 0 ? 'front' : 'other',
      dimensions: '2048 × 2048 · 1.8 MB',
      status: 'indexed',
      index_status: 'indexed',
      extraction_status: 'extracted',
      uploaded_at: new Date().toISOString(),
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
    setPendingFiles((prev) => prev.filter((pf) => pf.tempId !== photoId));
    showToast(lang === 'id' ? 'Foto referensi dihapus.' : 'Photo removed.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Synchronous lock to prevent any double-click or rapid multi-submit race conditions
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

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

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const normalizedHalalStatus: HalalStatus = halalStatus === 'halal' ? 'halal' : 'not_halal';
      const certTrim = certNo.trim();
      const productPayload: any = {
        sku_code: skuCode.trim(),
        name: name.trim(),
        manufacturer: manufacturer.trim(),
        category: category,
        brand: brand.trim() || name.split(' ')[0],
        description: description,
        halal_status: normalizedHalalStatus,
        index_status: autoIndex ? (photos.length > 0 ? 'indexed' : 'pending') : 'pending',
        halal_certificate: certTrim
          ? {
              certificate_no: certTrim,
              issuer: issuer || 'BPJPH',
              issued_date: issuedDate.trim() ? issuedDate.trim() : null,
              valid_until: validUntil.trim() ? validUntil.trim() : null,
            }
          : null,
      };

      let targetId = '';
      if (isEditing) {
        targetId = existingProduct?.id || id!;
        await dispatch(
          updateProduct({ id: targetId, payload: productPayload })
        ).unwrap();
      } else {
        const res: any = await dispatch(createProduct(productPayload)).unwrap();
        targetId = res?.data?.id || res?.id;
      }

      // Upload pending photo files directly to API-016 (POST /api/v1/products/{id}/photos)
      if (targetId && pendingFiles.length > 0) {
        for (const pf of pendingFiles) {
          try {
            await dispatch(
              uploadPhoto({
                productId: targetId,
                file: pf.file,
                packageSide: pf.packageSide,
              })
            ).unwrap();
          } catch (uploadErr) {
            console.warn('Failed to upload photo for product:', pf.file.name, uploadErr);
          }
        }
        setPendingFiles([]);
        await dispatch(fetchProductById(targetId));
      }

      showToast(
        lang === 'id'
          ? (isEditing ? 'Perubahan disimpan. Jejak audit dicatat (ENT-29).' : 'SKU berhasil didaftarkan. Jejak audit dicatat (ENT-29).')
          : (isEditing ? 'Changes saved. Audit trail recorded (ENT-29).' : 'SKU successfully registered. Audit trail recorded (ENT-29).')
      );

      if (targetId) {
        navigate(`/produk/detail/${targetId}`);
      } else {
        navigate('/produk');
      }
    } catch (err: any) {
      const serverErrCode = err?.response?.data?.error?.code;
      const rawUserMsg = err?.response?.data?.error?.user_message || (typeof err === 'string' && err);
      let errMsg =
        rawUserMsg ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        (lang === 'id' ? 'Gagal menyimpan produk.' : 'Failed to save product.');

      if (serverErrCode === 'ERR-4002' || errMsg.includes('already exists') || errMsg.includes('Data sudah ada')) {
        setDuplicateConflictInfo({
          skuCode: skuCode.trim(),
          certNo: certNo.trim(),
          message: rawUserMsg || 'Active sku_code already exists',
        });
        setDuplicateModalOpen(true);
        errMsg = lang === 'id'
          ? 'Data sudah terdaftar pada produk lain (ERR-4002).'
          : 'Data already exists on another product (ERR-4002).';
      }
      showToast(errMsg);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
      {/* Top Context Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          padding: '12px 18px',
          background: 'var(--sah-white)',
          border: '1px solid var(--sah-line)',
          borderRadius: 18,
          boxShadow: 'var(--sah-shadow)',
        }}
      >
        <button
          type="button"
          onClick={() => (id ? navigate(`/produk/detail/${id}`) : navigate('/produk'))}
          style={{
            background: 'none',
            border: 0,
            color: 'var(--sah-copper-dark)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>
            {id
              ? (lang === 'id' ? 'Kembali ke Detail Produk' : 'Back to Product Detail')
              : (lang === 'id' ? 'Kembali ke Daftar Produk' : 'Back to Product List')}
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: isEditing ? 'var(--sah-copper)' : 'var(--sah-blue-strong)',
              background: isEditing ? 'var(--sah-copper-pale)' : 'var(--sah-mist-soft)',
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid var(--sah-line)',
            }}
          >
            {isEditing
              ? (lang === 'id' ? 'Mode Sunting' : 'Edit Mode')
              : (lang === 'id' ? 'Pendaftaran Baru' : 'New Registration')}
          </span>
          {isEditing && (
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sah-navy)' }}>
              {name || skuCode}
            </span>
          )}
        </div>
      </div>

      {/* ── HERO BANNER: EDIT MODE PROFILE VS NEW REGISTRATION ONBOARDING ── */}
      {isEditing ? (
        <div
          style={{
            marginBottom: 18,
            padding: '20px 24px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, var(--sah-white) 0%, #fbf8f5 100%)',
            border: '1px solid rgba(197, 138, 99, 0.35)',
            boxShadow: '0 4px 20px rgba(23, 36, 58, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Avatar + Title & Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 280, flex: 1 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                background: primaryPhoto?.url
                  ? '#ffffff'
                  : 'linear-gradient(145deg, #24384e, #182436 60%, #4a2c22)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(23,36,58,0.12)',
                overflow: 'hidden',
                border: '2px solid #fff',
                padding: primaryPhoto?.url ? 6 : 0,
                boxSizing: 'border-box',
              }}
            >
              {primaryPhoto?.url ? (
                <img
                  src={primaryPhoto.url}
                  alt={name || existingProduct?.name || 'Product'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(23,36,58,.08))',
                  }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: 24,
                    color: 'rgba(255,253,248,0.95)',
                  }}
                >
                  {initialLetters}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: 'var(--sah-copper-dark)',
                    background: 'var(--sah-copper-pale)',
                    padding: '3px 9px',
                    borderRadius: 8,
                    border: '1px solid rgba(197, 138, 99, 0.3)',
                  }}
                >
                  {existingProduct?.sku_code || skuCode}
                </span>
                <span style={{ fontSize: 12, color: 'var(--sah-muted)', fontWeight: 600 }}>
                  {manufacturer || existingProduct?.manufacturer || 'Pabrikan belum diisi'}
                </span>
              </div>

              <h1
                style={{
                  margin: 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 21,
                  letterSpacing: -0.5,
                  color: 'var(--sah-navy)',
                }}
              >
                {name || existingProduct?.name || 'Nama Produk'}
              </h1>

              {/* Status pills row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 9px',
                    borderRadius: 999,
                    background: halalStatus === 'halal' ? 'rgba(39, 110, 144, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                    color: halalStatus === 'halal' ? 'var(--sah-blue-strong)' : '#b45309',
                    border: `1px solid ${halalStatus === 'halal' ? 'rgba(39, 110, 144, 0.25)' : 'rgba(217, 119, 6, 0.25)'}`,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                  {halalStatus === 'halal' ? 'Halal Terverifikasi' : 'Menunggu Verifikasi'}
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 9px',
                    borderRadius: 999,
                    background: 'var(--sah-ivory)',
                    color: 'var(--sah-navy)',
                    border: '1px solid var(--sah-line)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>{photos.length} Foto Kemasan</span>
                </span>

                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--sah-muted)',
                  }}
                >
                  Kategori: <strong>{category}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {id && (
              <Link
                to={`/produk/detail/${id}`}
                style={{
                  height: 38,
                  padding: '0 16px',
                  borderRadius: 12,
                  background: 'var(--sah-white)',
                  border: '1px solid var(--sah-line)',
                  color: 'var(--sah-navy)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 1px 4px rgba(23,36,58,0.04)',
                  transition: 'all .15s ease',
                }}
              >
                <span>Pratinjau SKU</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--sah-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </Link>
            )}

            {id && (
              <Link
                to={`/produk/foto/${id}`}
                style={{
                  height: 38,
                  padding: '0 16px',
                  borderRadius: 12,
                  background: 'var(--sah-copper-pale)',
                  border: '1px solid var(--sah-copper)',
                  color: 'var(--sah-copper-dark)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all .15s ease',
                }}
              >
                <span>Kelola Foto & AI</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* New Registration Welcome Banner */
        <div
          style={{
            marginBottom: 18,
            padding: '18px 22px',
            borderRadius: 22,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfd 100%)',
            border: '1px solid rgba(39, 110, 144, 0.25)',
            boxShadow: '0 2px 12px rgba(23, 36, 58, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'var(--sah-mist-soft)',
                border: '1px solid rgba(39, 110, 144, 0.2)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: 'var(--sah-blue-strong)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 17,
                  color: 'var(--sah-navy)',
                }}
              >
                Pendaftaran SKU Produk Baru
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sah-muted)', marginTop: 2 }}>
                Lengkapi identitas produk, data sertifikasi halal BPJPH, dan minimal 1 foto referensi kemasan.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 8,
                background: 'rgba(39, 110, 144, 0.08)',
                color: 'var(--sah-blue-strong)',
              }}
            >
              ID Otomatis
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 8,
                background: 'rgba(197, 138, 99, 0.08)',
                color: 'var(--sah-copper-dark)',
              }}
            >
              Multi-Foto AR-03
            </span>
          </div>
        </div>
      )}

      {/* ── ANCHOR NAVIGATION TABS ────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 18,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        <button
          type="button"
          onClick={() => scrollToSection('section-identity', 'identity')}
          style={{
            height: 36,
            padding: '0 16px',
            borderRadius: 12,
            border: activeSection === 'identity' ? '1.5px solid var(--sah-copper)' : '1px solid var(--sah-line)',
            background: activeSection === 'identity' ? 'var(--sah-copper-pale)' : 'var(--sah-white)',
            color: activeSection === 'identity' ? 'var(--sah-copper-dark)' : 'var(--sah-navy)',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            transition: 'all .15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span>Identitas Produk</span>
          {isEditing && (isNameChanged || isManufacturerChanged || isCategoryChanged || isBrandChanged || isDescriptionChanged) && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sah-copper)' }} />
          )}
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('section-halal', 'halal')}
          style={{
            height: 36,
            padding: '0 16px',
            borderRadius: 12,
            border: activeSection === 'halal' ? '1.5px solid var(--sah-copper)' : '1px solid var(--sah-line)',
            background: activeSection === 'halal' ? 'var(--sah-copper-pale)' : 'var(--sah-white)',
            color: activeSection === 'halal' ? 'var(--sah-copper-dark)' : 'var(--sah-navy)',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            transition: 'all .15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
          <span>Sertifikat Halal</span>
          {isEditing && (isCertNoChanged || isIssuerChanged || isIssuedDateChanged || isValidUntilChanged || isHalalStatusChanged) && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sah-copper)' }} />
          )}
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('section-photos', 'photos')}
          style={{
            height: 36,
            padding: '0 16px',
            borderRadius: 12,
            border: activeSection === 'photos' ? '1.5px solid var(--sah-copper)' : '1px solid var(--sah-line)',
            background: activeSection === 'photos' ? 'var(--sah-copper-pale)' : 'var(--sah-white)',
            color: activeSection === 'photos' ? 'var(--sah-copper-dark)' : 'var(--sah-navy)',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            transition: 'all .15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>Foto Kemasan ({photos.length})</span>
          {isEditing && isPhotosChanged && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sah-copper)' }} />
          )}
        </button>
      </div>

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
            id="section-identity"
            style={{
              scrollMarginTop: 90,
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                    Kode SKU <span style={{ color: 'var(--sah-copper-dark)' }}>*</span>
                  </span>
                  {!isEditing && !isReadOnly && (
                    <button
                      type="button"
                      onClick={() => setSkuCode(`SKU-${Math.floor(100000 + Math.random() * 900000)}`)}
                      style={{
                        background: 'none',
                        border: 0,
                        color: 'var(--sah-copper-dark)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Acak Kode SKU
                    </button>
                  )}
                  {isEditing && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: 'var(--sah-muted)', background: 'rgba(23,36,58,0.06)', padding: '2px 7px', borderRadius: 6 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Kunci Entitas</span>
                    </span>
                  )}
                  {isSkuChanged && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--sah-copper-dark)', background: 'var(--sah-copper-pale)', padding: '1px 6px', borderRadius: 6 }}>
                      Diubah
                    </span>
                  )}
                </div>
                <input
                  value={skuCode}
                  onChange={(e) => setSkuCode(e.target.value)}
                  placeholder="SKU-100241"
                  required
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: isSkuChanged ? '1.5px solid var(--sah-copper)' : '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isSkuChanged ? '#fffaf6' : (isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)'),
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                    Nama produk <span style={{ color: 'var(--sah-copper-dark)' }}>*</span>
                  </span>
                  {isNameChanged && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--sah-copper-dark)', background: 'var(--sah-copper-pale)', padding: '1px 6px', borderRadius: 6 }}>
                      Diubah
                    </span>
                  )}
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kecap Manis Bango 275 ml"
                  required
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: isNameChanged ? '1.5px solid var(--sah-copper)' : '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isNameChanged ? '#fffaf6' : (isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)'),
                    fontSize: 13,
                    color: 'var(--sah-navy)',
                    cursor: isReadOnly ? 'not-allowed' : 'text',
                  }}
                />
              </label>

              {/* Produsen */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sah-blue)' }}>
                    Produsen <span style={{ color: 'var(--sah-copper-dark)' }}>*</span>
                  </span>
                  {isManufacturerChanged && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--sah-copper-dark)', background: 'var(--sah-copper-pale)', padding: '1px 6px', borderRadius: 6 }}>
                      Diubah
                    </span>
                  )}
                </div>
                <input
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="Unilever Indonesia"
                  required
                  disabled={isReadOnly}
                  style={{
                    height: 44,
                    padding: '0 14px',
                    border: isManufacturerChanged ? '1.5px solid var(--sah-copper)' : '1px solid var(--sah-line)',
                    borderRadius: 14,
                    background: isManufacturerChanged ? '#fffaf6' : (isReadOnly ? 'rgba(23,36,58,.04)' : 'var(--sah-ivory)'),
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
            id="section-halal"
            style={{
              scrollMarginTop: 90,
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
                  Nomor sertifikat <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--sah-muted)' }}>(Opsional)</span>
                </span>
                <input
                  value={certNo}
                  onChange={(e) => setCertNo(e.target.value)}
                  placeholder="Contoh: ID00410000123456790125"
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
                <span style={{ fontSize: 11, color: 'var(--sah-muted)', lineHeight: 1.3 }}>
                  Contoh format: ID00410000123456790125 (Kosongkan bila belum memiliki sertifikat halal resmi)
                </span>
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
            id="section-photos"
            style={{
              scrollMarginTop: 90,
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
                {(() => {
                  const sideCounts: Record<string, number> = {};
                  const currentBrand =
                    brand || existingProduct?.brand || name || existingProduct?.name || skuCode || 'produk';

                  return photos.map((p, idx) => {
                    const sideKey = p.package_side || 'front';
                    const sideIndex = sideCounts[sideKey] || 0;
                    sideCounts[sideKey] = sideIndex + 1;

                    const sideLabel = packageSideDisplayLabel(sideKey, lang);
                    const statusCfg = getExtractionStatusConfig(p.extraction_status, p.status, lang);
                    const uploadedDateText = formatPhotoTimestamp(p.uploaded_at || p.created_at, lang);
                    const displayFileName = formatPhotoFileName(currentBrand, sideKey, sideIndex);

                    const dimensionText = p.width && p.height
                      ? `${p.width} × ${p.height}${p.file_size ? ` · ${(p.file_size / (1024 * 1024)).toFixed(1)} MB` : ''}`
                      : (p.dimensions || '2048 × 2048');

                    return (
                      <div
                        key={p.id || idx}
                        style={{
                          border: p.is_primary ? '1.5px solid var(--sah-copper)' : '1px solid var(--sah-line)',
                          borderRadius: 18,
                          overflow: 'hidden',
                          background: 'var(--sah-white)',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: p.is_primary
                            ? '0 4px 12px rgba(197,138,99,.2)'
                            : '0 2px 8px rgba(23,36,58,.04)',
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
                            height: 140,
                            background: p.url
                              ? 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f4f5f8 100%)'
                              : 'linear-gradient(145deg,#477fa2,#25384a 58%,#6f3f32)',
                            display: 'grid',
                            placeItems: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            padding: p.url ? '8px 10px' : 0,
                            boxSizing: 'border-box',
                          }}
                        >
                          {p.url ? (
                            <img
                              src={p.url}
                              alt={displayFileName}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 2px 6px rgba(23,36,58,.08))',
                              }}
                            />
                          ) : (
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

                          {/* Package side badge top-left */}
                          <span
                            style={{
                              position: 'absolute',
                              top: 7,
                              left: 7,
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
                            {sideLabel}
                          </span>

                          {/* Primary / Utama badge top-right */}
                          {p.is_primary && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 7,
                                right: 7,
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: 'var(--sah-copper)',
                                color: 'var(--sah-white)',
                                fontSize: 9.5,
                                fontWeight: 800,
                                letterSpacing: 0.5,
                                textTransform: 'uppercase',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                              }}
                            >
                              Utama
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            padding: '12px 14px',
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
                            title={displayFileName}
                          >
                            {displayFileName}
                          </div>

                          <div
                            style={{
                              fontSize: 10.5,
                              color: 'var(--sah-muted)',
                              lineHeight: 1.35,
                            }}
                          >
                            <div>{dimensionText}</div>
                            {uploadedDateText && uploadedDateText !== '—' && (
                              <div style={{ color: '#64748b', marginTop: 2, fontSize: 10 }}>
                                {uploadedDateText}
                              </div>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              marginTop: 4,
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '3px 9px',
                                borderRadius: 999,
                                fontSize: 10.5,
                                fontWeight: 600,
                                background: statusCfg.bg,
                                border: `1px solid ${statusCfg.border}`,
                                color: statusCfg.color,
                              }}
                            >
                              <span style={{ fontSize: 8 }}>{statusCfg.icon}</span>
                              {statusCfg.label}
                            </span>

                            {!isReadOnly && (
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
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
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
              {isEditing ? 'Kelola Perubahan SKU' : 'Pendaftaran SKU'}
            </div>
            {isEditing && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'var(--sah-copper-pale)',
                  color: 'var(--sah-copper-dark)',
                  border: '1px solid rgba(197, 138, 99, 0.3)',
                }}
              >
                EDIT MODE
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 12,
              color: 'var(--sah-muted)',
              lineHeight: 1.45,
            }}
          >
            {isEditing
              ? `Mode sunting aktif untuk ${existingProduct?.sku_code || skuCode}. Perubahan dicatat pada jejak audit ENT-29.`
              : 'Nomor sertifikat dan masa berlaku dimasukkan sebagaimana adanya (OS-03). Perubahan status halal dicatat pada jejak audit ENT-29.'}
          </div>

          {/* Edit Mode Dirty State Counter Card */}
          {isEditing && (
            changedFieldsCount > 0 ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: 'rgba(197, 138, 99, 0.1)',
                  border: '1px solid rgba(197, 138, 99, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 800, color: 'var(--sah-copper-dark)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{changedFieldsCount} Kolom Diubah</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    style={{
                      background: 'none',
                      border: 0,
                      color: 'var(--sah-copper-dark)',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Reset Semula
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--sah-muted)', lineHeight: 1.4 }}>
                  Klik tombol simpan di bawah untuk memperbarui katalog SKU.
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'var(--sah-ivory)',
                  border: '1px solid var(--sah-line)',
                  fontSize: 11.5,
                  color: 'var(--sah-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1C733F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Data formulir sesuai dengan katalog tersimpan</span>
              </div>
            )
          )}

          {/* Simpan Button */}
          <button
            type="submit"
            disabled={isSubmitting || isReadOnly}
            style={{
              height: 46,
              border: 0,
              borderRadius: 16,
              background: isReadOnly
                ? 'rgba(197, 138, 99, 0.35)'
                : (isEditing && changedFieldsCount > 0
                  ? 'linear-gradient(135deg, var(--sah-copper-dark) 0%, var(--sah-copper) 100%)'
                  : 'var(--sah-copper)'),
              boxShadow: (isEditing && changedFieldsCount > 0) ? '0 4px 14px rgba(197,138,99,0.35)' : 'none',
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
              transition: 'all .15s ease',
              opacity: isReadOnly ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isReadOnly && !isSubmitting) {
                e.currentTarget.style.background = 'var(--sah-copper-pressed)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isReadOnly && !isSubmitting) {
                e.currentTarget.style.background = (isEditing && changedFieldsCount > 0)
                  ? 'linear-gradient(135deg, var(--sah-copper-dark) 0%, var(--sah-copper) 100%)'
                  : 'var(--sah-copper)';
              }
            }}
          >
            <span>
              {isSubmitting
                ? 'Menyimpan…'
                : (isEditing
                  ? (changedFieldsCount > 0 ? `Simpan ${changedFieldsCount} Perubahan` : 'Simpan Perubahan')
                  : 'Daftarkan SKU Baru')}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {/* Batal Button */}
          <button
            type="button"
            onClick={() => (id ? navigate(`/produk/detail/${id}`) : navigate('/produk'))}
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
            {id ? 'Batal & Kembali ke Detail' : 'Batal'}
          </button>

          <div style={{ height: 1, background: 'var(--sah-line)', margin: '2px 0' }} />

          {/* SKU Summary Info Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              background: 'var(--sah-ivory)',
              border: '1px solid var(--sah-line)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--sah-muted)' }}>
              {isEditing ? 'Informasi Entitas SKU' : 'Spesifikasi Sistem'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--sah-muted)' }}>Kode SKU</span>
              <span style={{ fontWeight: 700, color: 'var(--sah-navy)' }}>{skuCode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--sah-muted)' }}>Status Halal</span>
              <span style={{ fontWeight: 700, color: halalStatus === 'halal' ? 'var(--sah-blue-strong)' : '#b45309' }}>
                {halalStatus === 'halal' ? 'Terverifikasi' : 'Menunggu'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--sah-muted)' }}>Foto Kemasan</span>
              <span style={{ fontWeight: 700, color: 'var(--sah-navy)' }}>{photos.length} berkas</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--sah-muted)' }}>Jejak Audit</span>
              <span style={{ fontWeight: 600, color: 'var(--sah-copper-dark)' }}>ENT-29 (Aktif)</span>
            </div>
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

    {/* Informative Duplicate Data Modal (ERR-4002) */}
    {duplicateModalOpen && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(23,36,58,.55)',
          backdropFilter: 'blur(5px)',
          display: 'grid',
          placeItems: 'center',
          padding: 20,
          animation: 'fadeIn .15s ease',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDuplicateModalOpen(false);
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: 'var(--sah-white)',
            borderRadius: 24,
            border: '1px solid var(--sah-line)',
            boxShadow: '0 20px 45px rgba(23,36,58,.25)',
            padding: '28px 26px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            animation: 'rise .2s ease',
            boxSizing: 'border-box',
          }}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 15,
                background: 'rgba(217, 119, 6, 0.12)',
                display: 'grid',
                placeItems: 'center',
                color: '#d97706',
                flex: 'none',
                border: '1px solid rgba(217, 119, 6, 0.25)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 17,
                  color: 'var(--sah-navy)',
                  lineHeight: 1.3,
                }}
              >
                Data Sudah Terdaftar di Produk Lain
              </div>
              <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600, marginTop: 3 }}>
                Konflik Keunikan Database (Kode: ERR-4002)
              </div>
            </div>
          </div>

          {/* Explanation text */}
          <div style={{ fontSize: 12.5, color: 'var(--sah-frame)', lineHeight: 1.55 }}>
            Database Sahabat Halal mewajibkan <strong>Kode SKU</strong> dan <strong>Nomor Sertifikat Halal</strong> bersifat unik. Salah satu atau kedua nilai berikut saat ini sudah terdaftar pada produk lain di katalog:
          </div>

          {/* Conflict Detail Box */}
          <div
            style={{
              background: 'var(--sah-ivory)',
              border: '1px solid var(--sah-line)',
              borderRadius: 16,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
              <span style={{ color: 'var(--sah-muted)', fontWeight: 600 }}>Kode SKU Input:</span>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', monospace",
                  fontWeight: 800,
                  color: 'var(--sah-navy)',
                  background: 'var(--sah-white)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--sah-line)',
                }}
              >
                {duplicateConflictInfo?.skuCode || skuCode}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
              <span style={{ color: 'var(--sah-muted)', fontWeight: 600 }}>Nomor Sertifikat Halal:</span>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', monospace",
                  fontWeight: 800,
                  color: 'var(--sah-navy)',
                  background: 'var(--sah-white)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--sah-line)',
                }}
              >
                {duplicateConflictInfo?.certNo || certNo || '(Kosong)'}
              </span>
            </div>
          </div>

          {/* Tip Box */}
          <div
            style={{
              fontSize: 12,
              color: 'var(--sah-navy)',
              background: 'rgba(39, 110, 144, 0.08)',
              border: '1px solid rgba(39, 110, 144, 0.2)',
              borderRadius: 12,
              padding: '10px 12px',
              lineHeight: 1.45,
            }}
          >
            💡 <strong>Solusi Cepat:</strong> Klik tombol <strong>"Acak Ulang SKU"</strong> di bawah agar sistem membuatkan Kode SKU baru yang terjamin unik, tanpa menghapus nama produk yang sudah Anda ketik.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={handleAutoResolveDuplicate}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 14,
                border: 0,
                background: 'var(--sah-copper)',
                color: 'var(--sah-white)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'background .15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sah-copper-pressed)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--sah-copper)')}
            >
              <span>⚡ Acak Ulang SKU</span>
            </button>

            <button
              type="button"
              onClick={() => setDuplicateModalOpen(false)}
              style={{
                height: 42,
                padding: '0 18px',
                borderRadius: 14,
                border: '1px solid var(--sah-line)',
                background: 'var(--sah-white)',
                color: 'var(--sah-navy)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'border-color .15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sah-copper)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sah-line)')}
            >
              Ubah Manual
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ProductFormPage;
