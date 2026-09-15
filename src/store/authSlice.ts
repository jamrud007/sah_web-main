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
  id: "usr-admin-02",
  email: ROLE_USER_MAP['US-02'].email,
  display_name: ROLE_USER_MAP['US-02'].name,
  role: "editor", // maps to US-02 content admin (full RW on catalog)
};

// Helper functions to safely read from localStorage
const getStoredUserInfo = (): UserInfo | null => {
  try {
    const stored = localStorage.getItem("userInfo");
    return stored ? (JSON.parse(stored) as UserInfo) : null;
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

// Initial state hydrated from localStorage or default dev user
const storedUserInfo = getStoredUserInfo();
const storedRefreshToken = getStoredToken();
// Only auto-authenticate if we have BOTH saved user info AND a token
const hasSession = storedUserInfo !== null && storedRefreshToken !== null;

const initialState: AuthState = {
  userInfo: storedUserInfo,
  accessToken: null, // Kept in-memory for security
  refreshToken: storedRefreshToken,
  isAuthenticated: hasSession,
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
      if (refreshToken) {
        const randomStr = Math.random().toString(36).slice(2, 8);
        const storagetoken = `${refreshToken}${randomStr}`;
        state.refreshToken = refreshToken;
        localStorage.setItem("token", storagetoken);
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
    },

    // Clear state on logout
    logout: (state) => {
      state.userInfo = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // Clean up localStorage items
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    },
  },
});

export const {
  setCredentials,
  switchRole,
  updateUserInfo,
  updateRefreshToken,
  updateAccessToken,
  logout,
} = authSlice.actions;

// ─── Async Thunks (Real Backend) ──────────────────────────────────────────

export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async (payload: AdminLoginPayload, { dispatch, rejectWithValue }) => {
    try {
      const data = await authService.login(payload);
      // Map backend user_info to frontend UserInfo shape
      const userInfo: UserInfo = {
        id: data.user_info.id,
        email: data.user_info.email,
        display_name: data.user_info.name,
        role: data.user_info.roles?.[0]?.code || 'editor',
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
