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

  const token =
    customToken ||
    localStorage.getItem('accessToken') ||
    'test-token-catalog_admin-1';

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
  const extractionStatus = raw.extraction_status || raw.status || raw.index_status || 'pending';
  const status: PhotoStatus =
    extractionStatus === 'extracted' || extractionStatus === 'indexed'
      ? 'indexed'
      : extractionStatus === 'failed'
      ? 'failed'
      : 'pending';

  return {
    id: photoId || `ph-${Math.random().toString(36).slice(2)}`,
    product_id: productId || raw.product_id || '',
    url,
    image_path: raw.image_path || raw.url,
    content_type: raw.content_type || 'image/jpeg',
    package_side: side,
    angle: packageSideDisplayLabel(side),
    status,
    index_status: status,
    file_name: raw.file_name || `${packageSideDisplayLabel(side)}.jpg`,
    file_size: raw.file_size,
    width: raw.width || 2048,
    height: raw.height || 2048,
    dimensions: raw.dimensions || `${packageSideDisplayLabel(side)} · Foto SKU`,
    qa_message: raw.qa_message || null,
    created_at: raw.created_at || raw.uploaded_at || new Date().toISOString(),
    is_primary: Boolean(raw.is_primary || side === 'front'),
  };
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
      return lang === 'id' ? 'Tutup / Atas' : 'Top / Cap';
    case 'bottom':
      return lang === 'id' ? 'Bawah' : 'Bottom';
    case 'other':
    default:
      return lang === 'id' ? 'Lainnya / Isi Ulang' : 'Other / Refill';
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
