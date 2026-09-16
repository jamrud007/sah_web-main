// src/store/productSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, Photo } from '../types/apiDef';
import { productService, type ProductListParams } from '../services/productService';
import { photoService, packageSideDisplayLabel, buildPhotoUrl } from '../services/photoService';

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
  items: [],
  selectedProduct: null,
  nextCursor: null,
  hasMore: false,
  loading: false,
  saving: false,
  error: null,
  photosByProductId: {},
  photoLoading: false,
};

// ─── Thunks ───────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: ProductListParams & { reset?: boolean } = {}, { rejectWithValue }) => {
    try {
      const result = await productService.list(params);
      return { result, reset: params.reset ?? (!params.cursor) };
    } catch (err: any) {
      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Gagal memuat produk dari server API';
      return rejectWithValue(message);
    }
  },
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await productService.get(id);
    } catch (err: any) {
      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Gagal memuat detail produk';
      return rejectWithValue(message);
    }
  },
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (payload: Parameters<typeof productService.create>[0], { rejectWithValue }) => {
    try {
      return await productService.create(payload);
    } catch (err: any) {
      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Gagal membuat produk di server';
      return rejectWithValue(message);
    }
  },
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, payload }: { id: string; payload: Parameters<typeof productService.update>[1] }, { rejectWithValue }) => {
    try {
      return await productService.update(id, payload);
    } catch (err: any) {
      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Gagal memperbarui produk di server';
      return rejectWithValue(message);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.remove(id);
      return id;
    } catch (err: any) {
      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Gagal menghapus produk dari server';
      return rejectWithValue(message);
    }
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
      const photoId = res.photo_id || 'ph-' + Date.now().toString(36);
      const photoPath = `/api/v1/products/${productId}/photos/${photoId}/image`;
      const photo: Photo = {
        id: photoId,
        product_id: productId,
        url: buildPhotoUrl(photoPath) || objectUrl,
        image_path: photoPath,
        package_side: res.package_side || packageSide || 'other',
        angle: packageSideDisplayLabel(res.package_side || packageSide || 'other'),
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
      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Gagal mengunggah foto ke server';
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
      const message =
        err.response?.data?.error?.user_message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Gagal menghapus foto dari server';
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
      state.items = [];
      state.nextCursor = null;
      state.hasMore = false;
      state.error = null;
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
        const { result, reset } = action.payload as any;
        const newItems = result.items ?? [];
        if (reset) {
          state.items = newItems;
        } else {
          state.items = [...state.items, ...newItems];
        }
        state.nextCursor = result.next_cursor ?? null;
        state.hasMore = result.has_more ?? !!result.next_cursor;
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
        const idx = state.items.findIndex(
          (p) => p.id === action.payload.id || p.sku_code === action.payload.sku_code,
        );
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        } else {
          state.items.push(action.payload);
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
