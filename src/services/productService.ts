// src/services/productService.ts
import api from './AxiosInstance';
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
    if (res.data?.data && Array.isArray(res.data.data.items)) {
      return res.data.data;
    }
    if (Array.isArray(res.data?.items)) {
      return res.data;
    }
    return res.data;
  },

  /** GET /api/v1/products/:id */
  get: async (id: string): Promise<Product> => {
    const res = await api.get<any>(`/api/v1/products/${id}`);
    if (res.data?.data) {
      return res.data.data;
    }
    return res.data;
  },

  /** POST /api/v1/products */
  create: async (payload: ProductCreate): Promise<Product> => {
    const res = await api.post<any>('/api/v1/products', payload);
    if (res.data?.data) {
      return res.data.data;
    }
    return res.data;
  },

  /** PATCH /api/v1/products/:id */
  update: async (id: string, payload: ProductUpdate): Promise<Product> => {
    const res = await api.patch<any>(
      `/api/v1/products/${id}`,
      payload,
    );
    if (res.data?.data) {
      return res.data.data;
    }
    return res.data;
  },

  /** DELETE /api/v1/products/:id */
  remove: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/products/${id}`);
  },
};
