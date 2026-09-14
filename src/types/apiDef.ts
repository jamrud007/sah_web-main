// src/types/apiDef.ts
// Synced with OpenAPI spec at https://sah-dev.halotec.site/openapi.json

// ─── Auth ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  display_name: string;
  email: string;
  role: 'administrator' | 'editor';
  is_active: boolean;
}

export interface UserInput {
  display_name: string;
  email: string;
  password?: string;
  role: 'administrator' | 'editor';
  is_active?: boolean;
}

// ─── Halal Certificate ────────────────────────────────────────────────────

/** Shape used when CREATING/UPDATING (no id/sku_id yet) */
export interface HalalCertificate {
  certificate_no: string;       // required, max 64
  issuer?: string | null;       // max 120
  issued_date?: string | null;  // ISO date format
  valid_until?: string | null;  // ISO date format
}

/** Shape returned by API — includes id & sku_id */
export interface HalalCertificateItem extends HalalCertificate {
  id?: string;
  sku_id?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────

export type HalalStatus = 'halal' | 'not_halal' | 'pending' | 'non_halal';
export type IndexStatus = 'pending' | 'indexed' | 'failed';

export interface Product {
  id: string;                                  // UUID
  sku_code: string;
  name: string;
  manufacturer?: string | null;
  brand?: string | null;
  category?: string | null;
  description?: string | null;
  halal_status: HalalStatus;
  halal_registered_at?: string | null;
  index_status: IndexStatus;
  /** Real API field — array of certificates */
  halal_certificates?: HalalCertificateItem[] | null;
  /** Legacy / mock compat — singular object */
  halal_certificate?: HalalCertificate | null;
  photos?: Photo[];
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCreate {
  sku_code: string;                   // required, 1–64 chars
  name: string;                       // required, 1–200 chars
  manufacturer?: string | null;       // max 200
  brand?: string | null;              // max 120
  category?: string | null;           // max 80
  description?: string | null;
  halal_status?: HalalStatus;         // default: 'halal'
  halal_registered_at?: string | null;
  index_status?: IndexStatus;         // default: 'pending'
  /** Send as singular object on create/update */
  halal_certificate?: HalalCertificate | null;
  photos?: Photo[];
}

export interface ProductUpdate {
  sku_code?: string | null;
  name?: string | null;
  manufacturer?: string | null;
  brand?: string | null;
  category?: string | null;
  description?: string | null;
  halal_status?: HalalStatus | null;
  halal_registered_at?: string | null;
  index_status?: IndexStatus | null;
  /** Send as singular object on create/update */
  halal_certificate?: HalalCertificate | null;
  photos?: Photo[];
}

// ─── Photo ────────────────────────────────────────────────────────────────

export type BackendPhotoPackageSide =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'other';

export type PhotoPackageSide =
  | BackendPhotoPackageSide
  | 'depan'
  | 'belakang'
  | 'sisi_kiri'
  | 'sisi_kanan'
  | 'tutup'
  | 'kemasan_isi_ulang'
  | string; // allow free text from backend

export type PhotoStatus = 'pending' | 'indexed' | 'failed';

export interface Photo {
  id: string;       // UUID
  product_id: string;
  file_name?: string;
  file_size?: number;     // bytes
  width?: number;
  height?: number;
  package_side?: PhotoPackageSide | null;
  angle?: string;
  dimensions?: string;
  is_primary?: boolean;
  status: PhotoStatus;
  index_status?: IndexStatus;
  qa_message?: string | null;
  url?: string;
  created_at?: string;
}

export interface PhotoUploadInput {
  photo: File;
  package_side?: string;
}

export interface PhotoUploadResponse {
  photo_id: string;
  message_id?: string;
  state?: string;
  package_side?: string;
}

export interface PhotoActionResponse {
  message_id?: string;
  state?: string;
}

// ─── Story ────────────────────────────────────────────────────────────────

export interface StoryItem {
  id: string;
  title: string;
  summary: string;
  writer_id: string;
  writer_name: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface StoryInput {
  title: string;
  summary: string;
  content: string;
  thumbnail_url?: string;
  published_at?: string | null;
}

// ─── News ─────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  thumbnail_url?: string;
  author: string;
  published_at?: string | null;
}

export interface NewsInput {
  title: string;
  summary: string;
  content: string;
  thumbnail_url?: string;
  author: string;
  published_at?: string | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

/** Cursor-based pagination (used by /api/v1/products) */
export interface CursorPage<T> {
  items: T[];
  next_cursor?: string | null;
  total?: number;
}