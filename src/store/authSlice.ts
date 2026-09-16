import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type AuthState, type UserInfo } from "../types/auth";
import { authService, type AdminLoginPayload } from '../services/authService';

export type SahRole = 'US-02' | 'US-04' | 'US-05';

export const ROLE_USER_MAP: Record<SahRole, { name: string; roleName: string; email: string }> = {
  'US-02': { name: 'Rizky Ananda', roleName: 'US-02 Administrator Konten', email: 'rizky.ananda@sahabathalal.id' },
  'US-04': { name: 'Budi Santoso', roleName: 'US-04 Administrator Sistem', email: 'budi.santoso@sahabathalal.id' },
  'US-05': { name: 'Lestari Wulandari', roleName: 'US-05 Analis', email: 'lestari.w@sahabathalal.id' },
};

export const DEFAULT_USER: UserInfo = {
  id: "usr-admin-01",
  email: "catalog@sah.id",
  display_name: "Administrator Katalog",
  role: "content_manager",
  roles: ["content_manager", "catalog_admin"],
  isAllRole: true,
};

// Helper functions to safely read from localStorage
const getStoredUserInfo = (): UserInfo | null => {
  try {
    const stored = localStorage.getItem("userInfo");
    if (!stored) return null;
    const parsed = JSON.parse(stored) as UserInfo;
    // Auto-normalize su@sah.id and catalog@sah.id
    if (parsed.email?.toLowerCase() === 'su@sah.id') {
      parsed.isAllRole = true;
      parsed.role = 'allrole';
    } else if (parsed.email?.toLowerCase() === 'catalog@sah.id') {
      parsed.role = 'content_manager';
    }
    return parsed;
  } catch (error) {
    console.error("Failed to parse userInfo from localStorage:", error);
    return null;
  }
};

const getStoredToken = (): string | null => {
  try {
    let token = localStorage.getItem("token") || null;
    if (token) {
      token = token.slice(0, -6);
    }
    return token;
  } catch {
    return null;
  }
};

const isProductionMode =
  import.meta.env.MODE === 'production' ||
  import.meta.env.VITE_AUTH_MODE === 'production' ||
  localStorage.getItem('auth_mode') === 'production';

const getStoredAccessToken = (): string | null => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) return token;
    // In dev mode, provide fallback dev token if not set
    return isProductionMode ? null : "test-token-catalog_admin-1";
  } catch {
    return isProductionMode ? null : "test-token-catalog_admin-1";
  }
};

// Initial state hydrated from localStorage or default dev user
const storedAccessToken = getStoredAccessToken();
const storedUserInfo = getStoredUserInfo() || (isProductionMode ? null : DEFAULT_USER);
const storedRefreshToken = getStoredToken();

const initialState: AuthState = {
  userInfo: storedUserInfo,
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
  isAuthenticated: isProductionMode ? Boolean(storedAccessToken && !storedAccessToken.startsWith("test-token-")) : true,
  isLoading: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to set user info upon login
    setCredentials: (
      state,
      action: PayloadAction<{
        userInfo: UserInfo;
        accessToken: string;
        refreshToken?: string;
      }>,
    ) => {
      const { userInfo, accessToken, refreshToken } = action.payload;

      state.userInfo = userInfo;
      state.accessToken = accessToken;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        const randomStr = Math.random().toString(36).slice(2, 8);
        const storagetoken = `${refreshToken}${randomStr}`;
        state.refreshToken = refreshToken;
        localStorage.setItem("token", storagetoken);
        localStorage.setItem("refreshToken", refreshToken);
      }
      state.isAuthenticated = true;

      // Store serialized userInfo to localStorage
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    },

    // Action to switch role dynamically (e.g. from Topbar Role Switcher)
    switchRole: (state, action: PayloadAction<SahRole | 'administrator' | 'editor'>) => {
      if (!state.userInfo) {
        state.userInfo = { ...DEFAULT_USER };
      }
      const val = action.payload;
      if (val === 'US-02' || val === 'US-04' || val === 'US-05') {
        const info = ROLE_USER_MAP[val];
        state.userInfo.display_name = info.name;
        state.userInfo.email = info.email;
        state.userInfo.role = val === 'US-04' ? 'administrator' : 'editor';
      } else {
        state.userInfo.role = val;
      }
      localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
    },

    // Action to update user info partially
    updateUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
        // Sync updated user info to localStorage
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      }
    },

    // Action to update incoming refresh token
    updateRefreshToken: (state, action: PayloadAction<string>) => {
      const newRefreshToken = action.payload;
      state.refreshToken = newRefreshToken;
      try {
        const randomStr = Math.random().toString(36).slice(2, 8);
        const storagetoken = `${newRefreshToken}${randomStr}`;
        localStorage.setItem("token", storagetoken);
      } catch (error) {
        console.error("Failed to update token in localStorage:", error);
      }
    },

    // Action to update incoming access token
    updateAccessToken: (state, action: PayloadAction<string>) => {
      const newAccessToken = action.payload;
      state.accessToken = newAccessToken;
      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
      }
    },

    // Action to set bypass dev session
    setDevBypassSession: (state) => {
      state.userInfo = DEFAULT_USER;
      state.accessToken = "test-token-catalog_admin-1";
      state.refreshToken = null;
      state.isAuthenticated = true;
      localStorage.setItem("auth_mode", "dev");
      localStorage.setItem("accessToken", "test-token-catalog_admin-1");
      localStorage.setItem("userInfo", JSON.stringify(DEFAULT_USER));
    },

    // Clear state on logout
    logout: (state) => {
      state.userInfo = isProductionMode ? null : DEFAULT_USER;
      state.accessToken = isProductionMode ? null : "test-token-catalog_admin-1";
      state.refreshToken = null;
      state.isAuthenticated = !isProductionMode;

      // Clean up localStorage items
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const {
  setCredentials,
  switchRole,
  updateUserInfo,
  updateRefreshToken,
  updateAccessToken,
  setDevBypassSession,
  logout,
} = authSlice.actions;

// ─── Async Thunks (Real Backend) ──────────────────────────────────────────

export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async (payload: AdminLoginPayload, { dispatch, rejectWithValue }) => {
    try {
      const data = await authService.login(payload);
      const email = (payload.email || data.user_info?.email || '').toLowerCase().trim();
      const rolesList: string[] = Array.isArray(data.user_info?.roles)
        ? data.user_info.roles.map((r: any) => (typeof r === 'string' ? r : r.code || r.name)).filter(Boolean)
        : [];

      const isAllRole =
        email === 'su@sah.id' ||
        rolesList.some((r) => ['all', 'allrole', 'all_role', 'super_admin', 'superadmin'].includes(r.toLowerCase())) ||
        rolesList.length >= 3;

      let primaryRole = 'content_manager';
      if (isAllRole) {
        primaryRole = 'allrole';
      } else if (
        email === 'catalog@sah.id' ||
        rolesList.some((r) => ['content', 'content_manager', 'catalog', 'catalog_admin', 'editor'].includes(r.toLowerCase()))
      ) {
        primaryRole = 'content_manager';
      } else if (rolesList.some((r) => ['analyst', 'analytic'].includes(r.toLowerCase()))) {
        primaryRole = 'analyst';
      } else if (rolesList.some((r) => ['system_admin', 'super_user', 'admin', 'administrator'].includes(r.toLowerCase()))) {
        primaryRole = 'system_admin';
      } else if (rolesList[0]) {
        primaryRole = rolesList[0];
      }

      // Map backend user_info to frontend UserInfo shape
      const userInfo: UserInfo = {
        id: data.user_info.id,
        email: data.user_info.email,
        display_name: data.user_info.name,
        role: primaryRole,
        roles: rolesList,
        isAllRole,
      };
      dispatch(setCredentials({
        userInfo,
        accessToken: data.token,
        refreshToken: data.refresh_token,
      }));
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.error?.user_message ||
                  err?.response?.data?.message ||
                  'Login gagal. Periksa email dan kata sandi Anda.';
      return rejectWithValue(msg);
    }
  },
);

export const logoutAsync = createAsyncThunk(
  'auth/logoutAsync',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch {
      // Silently ignore — still clear local state
    } finally {
      dispatch(logout());
    }
  },
);

export default authSlice.reducer;

// ─── Role & Permission Utilities ──────────────────────────────────────────

export const checkIsAllRole = (userInfo?: UserInfo | null): boolean => {
  if (!userInfo) return false;
  if (userInfo.isAllRole) return true;
  const email = (userInfo.email || '').toLowerCase().trim();
  if (email === 'su@sah.id') return true;
  const role = (userInfo.role || '').toLowerCase().trim();
  if (['all', 'allrole', 'all_role', 'super_admin', 'superadmin'].includes(role)) return true;
  if (userInfo.roles?.some((r) => ['all', 'allrole', 'all_role', 'super_admin', 'superadmin'].includes(r.toLowerCase()))) return true;
  if ((userInfo.roles?.length || 0) >= 3) return true;
  return false;
};

export const getSahRole = (userInfo?: UserInfo | null): SahRole => {
  if (checkIsAllRole(userInfo)) return 'US-02'; // All role has full write access (like US-02)
  const role = (userInfo?.role || '').toLowerCase().trim();
  const email = (userInfo?.email || '').toLowerCase().trim();
  if (['super_user', 'admin', 'administrator', 'superuser', 'system_admin'].includes(role)) {
    return 'US-04';
  }
  if (['analyst', 'analytic', 'us-05'].includes(role) || email.includes('lestari')) {
    return 'US-05';
  }
  return 'US-02';
};

export const checkIsReadOnly = (userInfo?: UserInfo | null): boolean => {
  if (checkIsAllRole(userInfo)) return false; // Super admin / allrole is never read-only
  const role = getSahRole(userInfo);
  return role === 'US-04' || role === 'US-05';
};

export const getRoleDisplayName = (userInfo?: UserInfo | null): string => {
  if (checkIsAllRole(userInfo)) return 'Semua Peran (Super Admin)';
  const role = (userInfo?.role || '').toLowerCase().trim();
  const email = (userInfo?.email || '').toLowerCase().trim();
  if (email === 'catalog@sah.id' || ['content', 'content_manager', 'catalog_admin', 'catalog', 'editor'].includes(role)) {
    return 'Administrator Konten';
  }
  const roleLabel: Record<string, string> = {
    content: 'Administrator Konten',
    content_manager: 'Administrator Konten',
    catalog_admin: 'Administrator Konten',
    catalog: 'Administrator Konten',
    editor: 'Administrator Konten',
    super_user: 'Administrator Sistem',
    superuser: 'Administrator Sistem',
    admin: 'Administrator Sistem',
    administrator: 'Administrator Sistem',
    system_admin: 'Administrator Sistem',
    analyst: 'Analis',
    analytic: 'Analis',
  };
  return roleLabel[role] || userInfo?.role || 'Pengguna';
};
