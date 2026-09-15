// src/store/productSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, Photo } from '../types/apiDef';
import { productService, type ProductListParams } from '../services/productService';
import { photoService, packageSideDisplayLabel } from '../services/photoService';

// ─── Initial Mock Data from SAH Web Admin (standalone).html ───────────────

export const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    sku_code: 'SKU-100241',
    name: 'Kecap Manis Bango 275 ml',
    manufacturer: 'Unilever Indonesia',
    brand: 'Bango',
    category: 'Bumbu Masak',
    halal_status: 'halal',
    halal_registered_at: '2026-01-12T00:00:00Z',
    index_status: 'indexed',
    halal_certificate: {
      certificate_no: 'ID0011000000001',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-01-10',
      valid_until: '2026-01-10',
    },
    created_at: '2026-01-12T08:00:00Z',
    updated_at: '2026-01-12T08:00:00Z',
  },
  {
    id: 'prod-02',
    sku_code: 'SKU-100258',
    name: 'Indomie Goreng Rendang',
    manufacturer: 'Indofood CBP',
    brand: 'Indomie',
    category: 'Mie Instan',
    halal_status: 'halal',
    halal_registered_at: '2026-01-14T00:00:00Z',
    index_status: 'indexed',
    halal_certificate: {
      certificate_no: 'ID0011000000002',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-01-14',
      valid_until: '2026-01-14',
    },
    created_at: '2026-01-14T08:00:00Z',
    updated_at: '2026-01-14T08:00:00Z',
  },
  {
    id: 'prod-03',
    sku_code: 'SKU-100311',
    name: 'Teh Kotak Jasmine 300 ml',
    manufacturer: 'Ultrajaya Milk',
    brand: 'Teh Kotak',
    category: 'Minuman Siap Minum',
    halal_status: 'halal',
    halal_registered_at: '2026-01-21T00:00:00Z',
    index_status: 'indexed',
    halal_certificate: {
      certificate_no: 'ID0011000000003',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-01-21',
      valid_until: '2026-01-21',
    },
    created_at: '2026-01-21T08:00:00Z',
    updated_at: '2026-01-21T08:00:00Z',
  },
  {
    id: 'prod-04',
    sku_code: 'SKU-100377',
    name: 'Biskuit Roma Kelapa 300 g',
    manufacturer: 'Mayora Indah',
    brand: 'Roma',
    category: 'Biskuit & Roti',
    halal_status: 'halal',
    halal_registered_at: '2026-02-02T00:00:00Z',
    index_status: 'pending',
    halal_certificate: {
      certificate_no: 'ID0011000000004',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-02-02',
      valid_until: '2026-02-02',
    },
    created_at: '2026-02-02T08:00:00Z',
    updated_at: '2026-02-02T08:00:00Z',
  },
  {
    id: 'prod-05',
    sku_code: 'SKU-100402',
    name: 'Minyak Goreng Sania 2 L',
    manufacturer: 'Wilmar Nabati',
    brand: 'Sania',
    category: 'Minyak & Mentega',
    halal_status: 'halal',
    halal_registered_at: '2026-02-09T00:00:00Z',
    index_status: 'indexed',
    halal_certificate: {
      certificate_no: 'ID0011000000005',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-02-09',
      valid_until: '2026-02-09',
    },
    created_at: '2026-02-09T08:00:00Z',
    updated_at: '2026-02-09T08:00:00Z',
  },
  {
    id: 'prod-06',
    sku_code: 'SKU-100455',
    name: 'Susu Bendera UHT 1 L',
    manufacturer: 'Frisian Flag Indonesia',
    brand: 'Frisian Flag',
    category: 'Susu & Olahan',
    halal_status: 'halal',
    halal_registered_at: '2026-02-17T00:00:00Z',
    index_status: 'indexed',
    halal_certificate: {
      certificate_no: 'ID0011000000006',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-02-17',
      valid_until: '2026-02-17',
    },
    created_at: '2026-02-17T08:00:00Z',
    updated_at: '2026-02-17T08:00:00Z',
  },
  {
    id: 'prod-07',
    sku_code: 'SKU-100488',
    name: 'Sambal ABC Extra Pedas 335 ml',
    manufacturer: 'Heinz ABC Indonesia',
    brand: 'ABC',
    category: 'Saus & Sambal',
    halal_status: 'halal',
    halal_registered_at: '2026-02-24T00:00:00Z',
    index_status: 'failed',
    halal_certificate: {
      certificate_no: 'ID0011000000007',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-02-24',
      valid_until: '2026-02-24',
    },
    created_at: '2026-02-24T08:00:00Z',
    updated_at: '2026-02-24T08:00:00Z',
  },
  {
    id: 'prod-08',
    sku_code: 'SKU-100503',
    name: 'Wafer Richeese Nabati 50 g',
    manufacturer: 'Kaldu Sari Nabati',
    brand: 'Richeese',
    category: 'Makanan Ringan',
    halal_status: 'pending',
    halal_registered_at: '2026-03-03T00:00:00Z',
    index_status: 'pending',
    halal_certificate: {
      certificate_no: 'ID0011000000008',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-03-03',
      valid_until: '2026-03-03',
    },
    created_at: '2026-03-03T08:00:00Z',
    updated_at: '2026-03-03T08:00:00Z',
  },
  {
    id: 'prod-09',
    sku_code: 'SKU-100544',
    name: 'Kopi Kapal Api Special 165 g',
    manufacturer: 'Santos Jaya Abadi',
    brand: 'Kapal Api',
    category: 'Minuman Kopi',
    halal_status: 'halal',
    halal_registered_at: '2026-03-11T00:00:00Z',
    index_status: 'indexed',
    halal_certificate: {
      certificate_no: 'ID0011000000009',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-03-11',
      valid_until: '2026-03-11',
    },
    created_at: '2026-03-11T08:00:00Z',
    updated_at: '2026-03-11T08:00:00Z',
  },
  {
    id: 'prod-10',
    sku_code: 'SKU-100577',
    name: 'Sari Roti Tawar Spesial',
    manufacturer: 'Nippon Indosari Corpindo',
    brand: 'Sari Roti',
    category: 'Roti & Kue',
    halal_status: 'halal',
    halal_registered_at: '2026-03-18T00:00:00Z',
    index_status: 'indexed',
    halal_certificate: {
      certificate_no: 'ID0011000000010',
      issuer: 'BPJPH / LPPOM MUI',
      issued_date: '2022-03-18',
      valid_until: '2026-03-18',
    },
    created_at: '2026-03-18T08:00:00Z',
    updated_at: '2026-03-18T08:00:00Z',
  },
];

export const INITIAL_MOCK_PHOTOS: Record<string, Photo[]> = {
  'prod-01': [
    {
      id: 'ph-01',
      product_id: 'prod-01',
      url: '',
      package_side: 'depan',
      status: 'indexed',
      width: 2048,
      height: 2048,
      file_size: 1887436,
      created_at: '2026-01-12T08:00:00Z',
    },
    {
      id: 'ph-02',
      product_id: 'prod-01',
      url: '',
      package_side: 'belakang',
      status: 'indexed',
      width: 2048,
      height: 2048,
      file_size: 1992294,
      created_at: '2026-01-12T08:00:00Z',
    },
    {
      id: 'ph-03',
      product_id: 'prod-01',
      url: '',
      package_side: 'sisi_kiri',
      status: 'pending',
      width: 1536,
      height: 1536,
      file_size: 1153433,
      qa_message: 'Pantulan cahaya pada label — kontras teks rendah.',
      created_at: '2026-01-12T08:00:00Z',
    },
    {
      id: 'ph-04',
      product_id: 'prod-01',
      url: '',
      package_side: 'sisi_kanan',
      status: 'indexed',
      width: 1536,
      height: 1536,
      file_size: 1120000,
      created_at: '2026-01-12T08:00:00Z',
    },
    {
      id: 'ph-05',
      product_id: 'prod-01',
      url: '',
      package_side: 'tutup',
      status: 'indexed',
      width: 1024,
      height: 1024,
      file_size: 850000,
      created_at: '2026-01-12T08:00:00Z',
    },
    {
      id: 'ph-06',
      product_id: 'prod-01',
      url: '',
      package_side: 'kemasan_isi_ulang',
      status: 'indexed',
      width: 1536,
      height: 1536,
      file_size: 1250000,
      created_at: '2026-01-12T08:00:00Z',
    },
  ],
};

// ─── State ────────────────────────────────────────────────────────────────

interface ProductState {
  items: Product[];
  selectedProduct: Product | null;
  nextCursor: string | null;
  hasMore: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  photosByProductId: Record<string, Photo[]>;
  photoLoading: boolean;
}

const initialState: ProductState = {
  items: INITIAL_MOCK_PRODUCTS,
  selectedProduct: null,
  nextCursor: null,
  hasMore: false,
  loading: false,
  saving: false,
  error: null,
  photosByProductId: INITIAL_MOCK_PHOTOS,
  photoLoading: false,
};

// ─── Thunks ───────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: ProductListParams & { reset?: boolean }, { getState }) => {
    try {
      const result = await productService.list(params);
      return { result, reset: params.reset ?? false, isFallback: false };
    } catch (err: any) {
      console.warn('API fetchProducts failed, using state fallback:', err?.message || err);
      const state = getState() as { products: ProductState };
      const baseItems = state.products.items.length > 0 ? state.products.items : INITIAL_MOCK_PRODUCTS;
      let filtered = [...baseItems];
      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.sku_code.toLowerCase().includes(query) ||
            p.manufacturer?.toLowerCase().includes(query) ||
            p.brand?.toLowerCase().includes(query),
        );
      }
      if (params.category) {
        filtered = filtered.filter((p) => p.category === params.category);
      }
      if (params.manufacturer) {
        filtered = filtered.filter((p) => p.manufacturer === params.manufacturer);
      }
      if (params.halal_status) {
        filtered = filtered.filter((p) => p.halal_status === params.halal_status);
      }
      return {
        result: {
          items: filtered,
          next_cursor: null,
          total: filtered.length,
        },
        reset: params.reset ?? false,
        isFallback: true,
      };
    }
  },
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string, { getState }) => {
    try {
      return await productService.get(id);
    } catch {
      // Fallback: find from current state or mock list
      const state = getState() as { products: ProductState };
      const found =
        state.products.items.find((p) => p.id === id || p.sku_code === id) ||
        INITIAL_MOCK_PRODUCTS.find((p) => p.id === id || p.sku_code === id);
      if (found) return found;
      // return placeholder product
      return {
        id,
        sku_code: id,
        name: 'Produk ' + id,
        halal_status: 'halal' as const,
        index_status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (payload: Parameters<typeof productService.create>[0]) => {
    try {
      return await productService.create(payload);
    } catch {
      // Fallback: mock created product locally
      const mockId = 'prod-' + Date.now().toString(36);
      const newProd: Product = {
        sku_code: payload.sku_code,
        name: payload.name,
        manufacturer: payload.manufacturer,
        brand: payload.brand,
        category: payload.category,
        description: payload.description,
        halal_status: payload.halal_status || 'halal',
        halal_registered_at: payload.halal_registered_at || new Date().toISOString(),
        index_status: payload.index_status || 'pending',
        halal_certificate: payload.halal_certificate,
        photos: payload.photos || [],
        id: mockId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newProd;
    }
  },
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, payload }: { id: string; payload: Parameters<typeof productService.update>[1] }) => {
    try {
      return await productService.update(id, payload);
    } catch {
      // Fallback: update locally
      const updatedProd: Product = {
        id,
        sku_code: payload.sku_code || id,
        name: payload.name || '',
        manufacturer: payload.manufacturer || null,
        brand: payload.brand || null,
        category: payload.category || null,
        description: payload.description || null,
        halal_status: payload.halal_status || 'halal',
        halal_registered_at: payload.halal_registered_at || null,
        index_status: payload.index_status || 'pending',
        halal_certificate: payload.halal_certificate || null,
        photos: payload.photos || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return updatedProd;
    }
  },
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string) => {
    try {
      await productService.remove(id);
    } catch {
      // Ignored for local fallback
    }
    return id;
  },
);

export const uploadPhoto = createAsyncThunk(
  'products/uploadPhoto',
  async (
    {
      productId,
      file,
      packageSide,
    }: { productId: string; file: File; packageSide?: string },
    { rejectWithValue },
  ) => {
    const objectUrl = URL.createObjectURL(file);
    try {
      const res = await photoService.upload(productId, file, packageSide);
      const photo: Photo = {
        id: res.photo_id || 'ph-' + Date.now().toString(36),
        product_id: productId,
        url: objectUrl,
        package_side: res.package_side || packageSide || 'front',
        angle: packageSideDisplayLabel(res.package_side || packageSide || 'front'),
        status: 'pending',
        index_status: 'pending',
        file_name: file.name,
        file_size: file.size,
        width: 1920,
        height: 1920,
        dimensions: `${file.name.slice(0, 16)} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        created_at: new Date().toISOString(),
      };
      return { productId, photo, raw: res };
    } catch (err: any) {
      // If productId is mock or offline without valid UUID, allow graceful local simulation
      const isMock = productId.startsWith('prod-') || !productId.includes('-');
      if (isMock) {
        const mockPhoto: Photo = {
          id: 'ph-' + Date.now().toString(36),
          product_id: productId,
          url: objectUrl,
          package_side: packageSide || 'front',
          angle: packageSideDisplayLabel(packageSide || 'front'),
          status: 'pending',
          index_status: 'pending',
          file_name: file.name,
          file_size: file.size,
          width: 1920,
          height: 1920,
          dimensions: `${file.name.slice(0, 16)} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          created_at: new Date().toISOString(),
        };
        return { productId, photo: mockPhoto, raw: { state: 'PENDING' } };
      }

      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Gagal mengunggah foto';
      return rejectWithValue(message);
    }
  },
);

export const deletePhoto = createAsyncThunk(
  'products/deletePhoto',
  async (
    { productId, photoId }: { productId: string; photoId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await photoService.remove(productId, photoId);
      return { productId, photoId, raw: res };
    } catch (err: any) {
      // If mock ID, allow graceful local delete
      if (
        photoId.startsWith('ph-') ||
        photoId.startsWith('photo-') ||
        productId.startsWith('prod-') ||
        !productId.includes('-')
      ) {
        return { productId, photoId, raw: { state: 'DELETE_PENDING' } };
      }
      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Gagal menghapus foto';
      return rejectWithValue(message);
    }
  },
);

export const reindexPhoto = createAsyncThunk(
  'products/reindexPhoto',
  async (
    { productId, photoId }: { productId: string; photoId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await photoService.reindex(productId, photoId);
      return { productId, photoId, raw: res };
    } catch (err: any) {
      // If mock ID, allow graceful local reindex
      if (
        photoId.startsWith('ph-') ||
        photoId.startsWith('photo-') ||
        productId.startsWith('prod-') ||
        !productId.includes('-')
      ) {
        return { productId, photoId, raw: { state: 'PENDING' } };
      }
      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Gagal melakukan indeks ulang';
      return rejectWithValue(message);
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selectedProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetList: (state) => {
      state.items = INITIAL_MOCK_PRODUCTS;
      state.nextCursor = null;
      state.hasMore = false;
    },
    setPhotosForProduct: (
      state,
      action: PayloadAction<{ productId: string; photos: Photo[] }>,
    ) => {
      state.photosByProductId[action.payload.productId] = action.payload.photos;
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { result, reset, isFallback } = action.payload as any;
        const newItems = result.items ?? [];
        if (reset) {
          if (!isFallback) {
            // Live data from backend database
            state.items = newItems;
          } else {
            // Fallback mode: only set if items was empty, otherwise preserve modified local state
            if (state.items.length === 0) {
              state.items = newItems;
            }
          }
        } else {
          state.items = [...state.items, ...newItems];
        }
        state.nextCursor = result.next_cursor ?? null;
        state.hasMore = !!result.next_cursor;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchProductById
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
        if (action.payload.photos) {
          state.photosByProductId[action.payload.id] = action.payload.photos;
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createProduct
    builder
      .addCase(createProduct.pending, (state) => { state.saving = true; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
        state.selectedProduct = action.payload;
        if (action.payload.photos && action.payload.photos.length > 0) {
          state.photosByProductId[action.payload.id] = action.payload.photos;
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // updateProduct
    builder
      .addCase(updateProduct.pending, (state) => { state.saving = true; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedProduct = action.payload;
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (action.payload.photos && action.payload.photos.length > 0) {
          state.photosByProductId[action.payload.id] = action.payload.photos;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // deleteProduct
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // uploadPhoto
    builder
      .addCase(uploadPhoto.pending, (state) => { state.photoLoading = true; })
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        state.photoLoading = false;
        const { productId, photo } = action.payload;
        if (!state.photosByProductId[productId]) {
          state.photosByProductId[productId] = [];
        }
        state.photosByProductId[productId].push(photo);

        if (state.selectedProduct?.id === productId) {
          state.selectedProduct.photos = [...(state.selectedProduct.photos || []), photo];
        }
        const item = state.items.find((p) => p.id === productId);
        if (item) {
          item.photos = [...(item.photos || []), photo];
        }
      })
      .addCase(uploadPhoto.rejected, (state, action) => {
        state.photoLoading = false;
        state.error = action.payload as string;
      });

    // deletePhoto
    builder
      .addCase(deletePhoto.fulfilled, (state, action) => {
        const { productId, photoId } = action.payload;
        if (state.photosByProductId[productId]) {
          state.photosByProductId[productId] = state.photosByProductId[
            productId
          ].filter((p) => p.id !== photoId);
        }
        if (state.selectedProduct?.id === productId && state.selectedProduct.photos) {
          state.selectedProduct.photos = state.selectedProduct.photos.filter((p) => p.id !== photoId);
        }
        const item = state.items.find((p) => p.id === productId);
        if (item && item.photos) {
          item.photos = item.photos.filter((p) => p.id !== photoId);
        }
      })
      .addCase(deletePhoto.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // reindexPhoto
    builder
      .addCase(reindexPhoto.fulfilled, (state, action) => {
        const { productId, photoId } = action.payload;
        const photos = state.photosByProductId[productId];
        if (photos) {
          const photo = photos.find((p) => p.id === photoId);
          if (photo) {
            photo.status = 'pending';
            photo.index_status = 'pending';
          }
        }
        if (state.selectedProduct?.id === productId && state.selectedProduct.photos) {
          const photo = state.selectedProduct.photos.find((p) => p.id === photoId);
          if (photo) {
            photo.status = 'pending';
            photo.index_status = 'pending';
          }
        }
        const item = state.items.find((p) => p.id === productId);
        if (item && item.photos) {
          const photo = item.photos.find((p) => p.id === photoId);
          if (photo) {
            photo.status = 'pending';
            photo.index_status = 'pending';
          }
        }
      });
  },
});

export const { clearSelected, clearError, resetList, setPhotosForProduct } =
  productSlice.actions;

export default productSlice.reducer;
