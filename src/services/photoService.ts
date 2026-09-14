// src/services/photoService.ts
import api from './AxiosInstance';
import type { Photo } from '../types/apiDef';

export const photoService = {
  /**
   * POST /api/v1/products/:productId/photos
   * multipart/form-data: { photo: File, package_side?: string }
   */
  upload: async (
    productId: string,
    file: File,
    packageSide?: string,
  ): Promise<Photo> => {
    const form = new FormData();
    form.append('photo', file);
    if (packageSide) form.append('package_side', packageSide);

    const res = await api.post<any>(
      `/api/v1/products/${productId}/photos`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data?.data || res.data;
  },

  /**
   * DELETE /api/v1/products/:productId/photos/:photoId
   */
  remove: async (productId: string, photoId: string): Promise<void> => {
    await api.delete(
      `/api/v1/products/${productId}/photos/${photoId}`,
    );
  },

  /**
   * POST /api/v1/products/:productId/photos/:photoId/reindex
   */
  reindex: async (productId: string, photoId: string): Promise<void> => {
    await api.post(
      `/api/v1/products/${productId}/photos/${photoId}/reindex`,
    );
  },
};
