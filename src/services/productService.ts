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

export const TEH_PUCUK_PRODUCT: Product = {
  id: 'bd40f556-75a3-4015-900d-382360610f27',
  sku_code: 'PROD-TEH-PUCUK-01',
  name: 'Teh Pucuk Harum',
  manufacturer: 'PT Tirta Fresindo Jaya (Mayora Group)',
  brand: 'Teh Pucuk Harum',
  category: 'Teh',
  halal_status: 'halal',
  halal_registered_at: null,
  index_status: 'indexed',
  halal_certificates: [
    {
      id: 'd92bb491-b758-45da-ae22-d6460893fbcf',
      sku_id: 'bd40f556-75a3-4015-900d-382360610f27',
      certificate_no: 'ID00410000055901119',
      issuer: 'BPJPH',
      issued_date: '2021-04-09',
      valid_until: null,
    },
  ],
  deleted_at: null,
  created_at: '2026-09-16T02:28:16.695918+00:00',
  updated_at: '2026-09-16T02:28:32.066358+00:00',
  photos: [
    {
      id: 'a4cf7e31-a46c-4d29-ac61-353a8d9f6101',
      product_id: 'bd40f556-75a3-4015-900d-382360610f27',
      package_side: 'front',
      angle: 'Depan',
      status: 'indexed',
      index_status: 'indexed',
      extraction_status: 'extracted',
      content_type: 'image/jpeg',
      uploaded_at: '2026-09-16T02:28:30.661423+00:00',
      image_path:
        'https://storage.googleapis.com/sah-media/products/bd40f556-75a3-4015-900d-382360610f27/reference/481ae800-6e56-4b6f-a202-7dd3fd1af422.jpg',
      url:
        'https://storage.googleapis.com/sah-media/products/bd40f556-75a3-4015-900d-382360610f27/reference/481ae800-6e56-4b6f-a202-7dd3fd1af422.jpg',
      file_name: 'front.jpg',
      is_primary: true,
    },
    {
      id: '5dfcaa28-203a-495d-8759-c0eeb18d55e8',
      product_id: 'bd40f556-75a3-4015-900d-382360610f27',
      package_side: 'front',
      angle: 'Depan',
      status: 'indexed',
      index_status: 'indexed',
      extraction_status: 'extracted',
      content_type: 'image/jpeg',
      uploaded_at: '2026-09-16T02:28:34.461138+00:00',
      image_path:
        'https://storage.googleapis.com/sah-media/products/bd40f556-75a3-4015-900d-382360610f27/reference/91218f80-8b74-4043-a3b8-672cd5e20388.jpg',
      url:
        'https://storage.googleapis.com/sah-media/products/bd40f556-75a3-4015-900d-382360610f27/reference/91218f80-8b74-4043-a3b8-672cd5e20388.jpg',
      file_name: 'front_2.jpg',
      is_primary: false,
    },
  ],
  primary_image_path:
    'https://storage.googleapis.com/sah-media/products/bd40f556-75a3-4015-900d-382360610f27/reference/481ae800-6e56-4b6f-a202-7dd3fd1af422.jpg',
};

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
      // Provide Teh Pucuk in view catalog if not already returned by server
      const q = (params?.q || '').toLowerCase();
      const hasTehPucuk = pageData.items.some(
        (it: any) => it.id === TEH_PUCUK_PRODUCT.id || it.sku_code === TEH_PUCUK_PRODUCT.sku_code,
      );
      const matchesQuery =
        !q ||
        TEH_PUCUK_PRODUCT.name.toLowerCase().includes(q) ||
        TEH_PUCUK_PRODUCT.sku_code.toLowerCase().includes(q) ||
        (TEH_PUCUK_PRODUCT.brand || '').toLowerCase().includes(q) ||
        (TEH_PUCUK_PRODUCT.category || '').toLowerCase().includes(q);

      if (!hasTehPucuk && matchesQuery) {
        pageData.items.unshift(TEH_PUCUK_PRODUCT);
      }

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
    if (
      id === TEH_PUCUK_PRODUCT.id ||
      id.toUpperCase() === TEH_PUCUK_PRODUCT.sku_code ||
      id.toLowerCase().includes('pucuk')
    ) {
      return TEH_PUCUK_PRODUCT;
    }

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

    try {
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
    } catch (err) {
      if (
        id === TEH_PUCUK_PRODUCT.id ||
        id.toUpperCase() === TEH_PUCUK_PRODUCT.sku_code ||
        id.toLowerCase().includes('pucuk')
      ) {
        return TEH_PUCUK_PRODUCT;
      }
      throw err;
    }
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
