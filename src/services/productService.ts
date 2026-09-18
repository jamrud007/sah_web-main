// src/services/productService.ts
import api from './AxiosInstance';
import { normalizePhoto } from './photoService';
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  CursorPage,
} from '../types/apiDef';

export interface ProductListParams {
  q?: string;
  category?: string;
  manufacturer?: string;
  halal_status?: string;
  active?: boolean;
  limit?: number;
  cursor?: string;
  sort?: string;
}

export const productService = {
  /** GET /api/v1/products — cursor-based list */
  list: async (params?: ProductListParams): Promise<CursorPage<Product>> => {
    const { reset: _reset, ...queryParams } = (params || {}) as any;
    const res = await api.get<any>('/api/v1/products', {
      params: queryParams,
    });
    const pageData = res.data?.data && Array.isArray(res.data.data.items)
      ? res.data.data
      : (Array.isArray(res.data?.items) ? res.data : res.data);

    if (pageData && Array.isArray(pageData.items)) {
      pageData.items = pageData.items.map((item: any) => {
        if (Array.isArray(item.photos) && item.photos.length > 0) {
          let foundPrimary = false;
          item.photos = item.photos.map((p: any) => {
            const norm = normalizePhoto(p, item.id);
            if (
              item.primary_image_path &&
              (p.image_path === item.primary_image_path || norm.url === item.primary_image_path)
            ) {
              norm.is_primary = true;
              foundPrimary = true;
            } else if (item.primary_image_path) {
              norm.is_primary = false;
            }
            return norm;
          });
          if (!foundPrimary && item.photos.length > 0) {
            item.photos[0].is_primary = true;
          }
        } else if (item.primary_image_path) {
          const synthetic = normalizePhoto(
            {
              id: `primary-${item.id}`,
              image_path: item.primary_image_path,
              package_side: 'front',
              is_primary: true,
              extraction_status: 'extracted',
            },
            item.id,
          );
          item.photos = [synthetic];
        }
        return item;
      });
    }
    return pageData;
  },

  /** GET /api/v1/products/:id — normalizes photos to frontend Photo interface */
  get: async (id: string): Promise<Product> => {
    let targetId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      try {
        const searchRes = await api.get<any>('/api/v1/products', { params: { q: id, limit: 10 } });
        const items = searchRes.data?.data?.items || searchRes.data?.items || [];
        const match = items.find((item: any) => item.sku_code === id || item.name === id);
        if (match?.id) targetId = match.id;
      } catch {
        // fallback
      }
    }

    const res = await api.get<any>(`/api/v1/products/${targetId}`);
    const raw: any = res.data?.data ?? res.data;

    // Normalize backend photos (image_path, extraction_status, uploaded_at)
    // into the frontend Photo interface (url, status, created_at, etc.)
    if (Array.isArray(raw.photos) && raw.photos.length > 0) {
      let foundPrimary = false;
      raw.photos = raw.photos.map((p: any) => {
        const norm = normalizePhoto(p, raw.id);
        if (
          raw.primary_image_path &&
          (p.image_path === raw.primary_image_path || norm.url === raw.primary_image_path)
        ) {
          norm.is_primary = true;
          foundPrimary = true;
        } else if (raw.primary_image_path) {
          norm.is_primary = false;
        }
        return norm;
      });
      if (!foundPrimary && raw.photos.length > 0) {
        raw.photos[0].is_primary = true;
      }
    } else if (raw.primary_image_path) {
      const synthetic = normalizePhoto(
        {
          id: `primary-${raw.id}`,
          image_path: raw.primary_image_path,
          package_side: 'front',
          is_primary: true,
          extraction_status: 'extracted',
        },
        raw.id,
      );
      raw.photos = [synthetic];
    }

    return raw;
  },

  /** POST /api/v1/products */
  create: async (payload: ProductCreate): Promise<Product> => {
    // Ensure required fields according to OpenAPI spec & server DB constraints
    const cleanPayload: any = {
      sku_code: payload.sku_code,
      name: payload.name,
      manufacturer: payload.manufacturer || 'PT Halotec Indonesia',
      brand: payload.brand || payload.name?.split(' ')[0] || 'Brand',
      category: payload.category || 'Biskuit dan Wafer',
      halal_status: payload.halal_status === 'not_halal' ? 'not_halal' : 'halal',
      index_status: payload.index_status || 'pending',
    };

    if (payload.halal_registered_at) {
      cleanPayload.halal_registered_at = payload.halal_registered_at;
    }

    if (payload.halal_certificate && payload.halal_certificate.certificate_no) {
      cleanPayload.halal_certificate = {
        certificate_no: payload.halal_certificate.certificate_no,
        issuer: payload.halal_certificate.issuer || 'BPJPH',
        issued_date: payload.halal_certificate.issued_date || null,
        valid_until: payload.halal_certificate.valid_until || null,
      };
    }

    const res = await api.post<any>('/api/v1/products', cleanPayload);
    if (res.data?.data) {
      return res.data.data;
    }
    return res.data;
  },

  /** PATCH /api/v1/products/:id */
  update: async (id: string, payload: ProductUpdate): Promise<Product> => {
    let targetId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      try {
        const searchRes = await api.get<any>('/api/v1/products', { params: { q: id, limit: 10 } });
        const items = searchRes.data?.data?.items || searchRes.data?.items || [];
        const match = items.find((item: any) => item.sku_code === id || item.name === id);
        if (match?.id) targetId = match.id;
      } catch {
        // fallback
      }
    }

    const cleanPayload: any = {};
    if (payload.sku_code !== undefined) cleanPayload.sku_code = payload.sku_code;
    if (payload.name !== undefined) cleanPayload.name = payload.name;
    if (payload.manufacturer !== undefined) cleanPayload.manufacturer = payload.manufacturer || 'PT Halotec Indonesia';
    if (payload.brand !== undefined) cleanPayload.brand = payload.brand;
    if (payload.category !== undefined) cleanPayload.category = payload.category;
    if (payload.halal_status !== undefined) cleanPayload.halal_status = payload.halal_status;
    if (payload.halal_registered_at !== undefined) cleanPayload.halal_registered_at = payload.halal_registered_at;
    if (payload.index_status !== undefined) cleanPayload.index_status = payload.index_status;
    if (payload.halal_certificate !== undefined) {
      cleanPayload.halal_certificate = payload.halal_certificate?.certificate_no
        ? {
            certificate_no: payload.halal_certificate.certificate_no,
            issuer: payload.halal_certificate.issuer || 'BPJPH',
            issued_date: payload.halal_certificate.issued_date || null,
            valid_until: payload.halal_certificate.valid_until || null,
          }
        : null;
    }

    const res = await api.patch<any>(
      `/api/v1/products/${targetId}`,
      cleanPayload,
    );
    if (res.data?.data) {
      return res.data.data;
    }
    return res.data;
  },

  /** DELETE /api/v1/products/:id */
  remove: async (id: string): Promise<void> => {
    let targetId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      try {
        const searchRes = await api.get<any>('/api/v1/products', { params: { q: id, limit: 10 } });
        const items = searchRes.data?.data?.items || searchRes.data?.items || [];
        const match = items.find((item: any) => item.sku_code === id || item.name === id);
        if (match?.id) targetId = match.id;
      } catch {
        // fallback
      }
    }
    await api.delete(`/api/v1/products/${targetId}`);
  },
};
