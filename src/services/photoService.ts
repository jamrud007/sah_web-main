// src/services/photoService.ts
import api from './AxiosInstance';
import type {
  Photo,
  PhotoStatus,
  BackendPhotoPackageSide,
  PhotoUploadResponse,
  PhotoActionResponse,
} from '../types/apiDef';

/**
 * Builds an authenticated URL for an image endpoint.
 * If imagePath starts with http or /api, appends ?token=... if token is available.
 */
export const buildPhotoUrl = (imagePath?: string, customToken?: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('blob:') || imagePath.startsWith('data:')) return imagePath;

  const rawToken =
    customToken ||
    localStorage.getItem('accessToken');

  const token = rawToken || (import.meta.env.DEV ? 'test-token-catalog_admin-1' : '');

  if (token) {
    if (imagePath.includes('token=')) return imagePath;
    const separator = imagePath.includes('?') ? '&' : '?';
    return `${imagePath}${separator}token=${encodeURIComponent(token)}`;
  }
  return imagePath;
};

/**
 * Normalizes backend raw photo object into frontend Photo interface
 */
export const normalizePhoto = (raw: any, productId: string, token?: string): Photo => {
  const photoId = raw.id || raw.photo_id;
  const rawPath =
    raw.image_path ||
    raw.url ||
    (photoId && productId ? `/api/v1/products/${productId}/photos/${photoId}/image` : '');
  const url = buildPhotoUrl(rawPath, token);
  const side = normalizePackageSide(raw.package_side || raw.angle);
  const rawExtractionStatus = raw.extraction_status || raw.status || raw.index_status || 'pending';
  const status: PhotoStatus =
    rawExtractionStatus === 'extracted' || rawExtractionStatus === 'indexed'
      ? 'indexed'
      : rawExtractionStatus === 'failed'
      ? 'failed'
      : 'pending';

  const uploadedAt = raw.uploaded_at || raw.created_at;

  return {
    id: photoId || `ph-${Math.random().toString(36).slice(2)}`,
    product_id: productId || raw.product_id || '',
    url,
    image_path: raw.image_path || raw.url,
    content_type: raw.content_type || 'image/jpeg',
    package_side: raw.package_side || side,
    angle: packageSideDisplayLabel(side),
    status,
    index_status: status,
    extraction_status: raw.extraction_status || (status === 'indexed' ? 'extracted' : status),
    uploaded_at: uploadedAt,
    file_name:
      raw.file_name && !raw.file_name.includes('refill') && !raw.file_name.startsWith('image ')
        ? raw.file_name
        : `${side}.jpg`,
    file_size: raw.file_size,
    width: raw.width || 2048,
    height: raw.height || 2048,
    dimensions: raw.dimensions || `${raw.width || 2048} × ${raw.height || 2048}`,
    qa_message: raw.qa_message || null,
    created_at: raw.created_at || uploadedAt || new Date().toISOString(),
    is_primary: Boolean(raw.is_primary || side === 'front'),
  };
};

/**
 * Format ISO timestamp into clean local Indonesian/English format
 * e.g. "16 Sep 2026, 14:57 WIB"
 */
export const formatPhotoTimestamp = (isoDate?: string, lang: 'id' | 'en' = 'id'): string => {
  if (!isoDate) return '—';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;

    const dateStr = d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${dateStr}, ${timeStr} WIB`;
  } catch {
    return isoDate;
  }
};

export interface ExtractionStatusConfig {
  label: string;
  icon: string;
  bg: string;
  border: string;
  color: string;
}

export const getExtractionStatusConfig = (
  extractionStatus?: string,
  status?: PhotoStatus,
  lang: 'id' | 'en' = 'id'
): ExtractionStatusConfig => {
  const norm = (extractionStatus || status || 'pending').toLowerCase();
  if (norm === 'extracted' || norm === 'indexed') {
    return {
      label: lang === 'id' ? 'Terindeks' : 'Indexed',
      icon: '●',
      bg: 'rgba(39, 110, 144, 0.12)',
      border: 'rgba(39, 110, 144, 0.28)',
      color: '#276e90',
    };
  }
  if (norm === 'failed' || norm === 'error') {
    return {
      label: lang === 'id' ? 'Gagal indeks' : 'Failed index',
      icon: '▲',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.28)',
      color: '#dc2626',
    };
  }
  return {
    label: lang === 'id' ? 'Menunggu indeks' : 'Pending index',
    icon: '○',
    bg: 'rgba(217, 119, 6, 0.12)',
    border: 'rgba(217, 119, 6, 0.28)',
    color: '#d97706',
  };
};

/**
 * Formats a photo filename as ("brand"-"side").jpg
 * Example: ("Sari Roti", "front") -> "sari-roti-front.jpg"
 * Example: ("Sari Roti", "other", 1) -> "sari-roti-other-2.jpg"
 */
export const formatPhotoFileName = (
  brandOrProduct?: string,
  side?: string,
  occurrenceIndex: number = 0,
): string => {
  const normSide = normalizePackageSide(side);
  const rawBrand = (brandOrProduct || 'produk')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const brandSlug = rawBrand || 'produk';
  const suffix = occurrenceIndex > 0 ? `-${occurrenceIndex + 1}` : '';
  return `${brandSlug}-${normSide}${suffix}.jpg`;
};

/**
 * Normalizes input angle / package side into one of the backend allowed enum values:
 * 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'other'
 */
export const normalizePackageSide = (side?: string): BackendPhotoPackageSide => {
  if (!side) return 'front';
  const s = side.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (s === 'front' || s === 'depan') return 'front';
  if (s === 'back' || s === 'belakang') return 'back';
  if (s === 'left' || s === 'sisi_kiri' || s === 'kiri') return 'left';
  if (s === 'right' || s === 'sisi_kanan' || s === 'kanan') return 'right';
  if (s === 'top' || s === 'tutup' || s === 'atas') return 'top';
  if (s === 'bottom' || s === 'bawah' || s === 'dasar') return 'bottom';
  return 'other';
};

/**
 * Human-friendly display label for each package side
 */
export const packageSideDisplayLabel = (side?: string, lang: 'id' | 'en' = 'id'): string => {
  const norm = normalizePackageSide(side);
  switch (norm) {
    case 'front':
      return lang === 'id' ? 'Depan' : 'Front';
    case 'back':
      return lang === 'id' ? 'Belakang' : 'Back';
    case 'left':
      return lang === 'id' ? 'Sisi Kiri' : 'Left Side';
    case 'right':
      return lang === 'id' ? 'Sisi Kanan' : 'Right Side';
    case 'top':
      return lang === 'id' ? 'Atas' : 'Top';
    case 'bottom':
      return lang === 'id' ? 'Bawah' : 'Bottom';
    case 'other':
    default:
      return lang === 'id' ? 'Lainnya' : 'Other';
  }
};

export const photoService = {
  /**
   * POST /api/v1/products/:productId/photos
   * multipart/form-data: { photo: File, package_side?: string }
   * Returns HTTP 202 Accepted: { data: { photo_id, message_id, state, package_side } }
   */
  upload: async (
    productId: string,
    file: File,
    packageSide?: string,
  ): Promise<PhotoUploadResponse> => {
    const form = new FormData();
    form.append('photo', file);
    const normalizedSide = normalizePackageSide(packageSide);
    form.append('package_side', normalizedSide);

    const res = await api.post<any>(
      `/api/v1/products/${productId}/photos`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data?.data || res.data;
  },

  /**
   * DELETE /api/v1/products/:productId/photos/:photoId
   * Returns HTTP 202 Accepted: { data: { message_id, state: 'DELETE_PENDING' } }
   */
  remove: async (productId: string, photoId: string): Promise<PhotoActionResponse> => {
    const res = await api.delete<any>(
      `/api/v1/products/${productId}/photos/${photoId}`,
    );
    return res.data?.data || res.data;
  },

  /**
   * POST /api/v1/products/:productId/photos/:photoId/reindex
   * Returns HTTP 202 Accepted: { data: { message_id, state: 'PENDING' } }
   */
  reindex: async (productId: string, photoId: string): Promise<PhotoActionResponse> => {
    const res = await api.post<any>(
      `/api/v1/products/${productId}/photos/${photoId}/reindex`,
    );
    return res.data?.data || res.data;
  },
};
