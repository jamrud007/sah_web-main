import axios from "axios";
import { store } from "@/store/index";
import {
  updateAccessToken,
  updateRefreshToken,
  logout,
} from "@/store/authSlice";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BE_BASEURL,
});

instance.interceptors.request.use(
  (config) => {
    let token = store.getState().auth.accessToken || localStorage.getItem("accessToken");
    // Fallback to dev test token in dev mode if no real token set
    if (!token && (import.meta.env.DEV || !import.meta.env.VITE_BE_BASEURL)) {
      token = "test-token-catalog_admin-1";
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const refreshToken = store.getState().auth.refreshToken || localStorage.getItem("refreshToken");
    if (refreshToken) {
      config.headers["x-refresh-token"] = refreshToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => {
    const headers = response.headers as Record<string, string | undefined>;

    // If middleware issued a NEW access token — update Redux
    const newAuthHeader =
      headers.authorization ??
      headers.Authorization ??
      headers["Authorization"];
    if (
      typeof newAuthHeader === "string" &&
      newAuthHeader.startsWith("Bearer ")
    ) {
      const newToken = newAuthHeader.split(" ")[1];
      store.dispatch(updateAccessToken(newToken));
      localStorage.setItem("accessToken", newToken);
    }

    // If middleware issued a NEW refresh token — update Redux
    const newRefreshToken =
      headers["x-refresh-token"] ?? headers["X-Refresh-Token"];
    if (typeof newRefreshToken === "string") {
      store.dispatch(updateRefreshToken(newRefreshToken));
      localStorage.setItem("refreshToken", newRefreshToken);
    }

    return response;
  },
  async (error) => {
    // If token expired or unauthorized on protected endpoint, clear session cleanly
    if (error.response?.status === 401) {
      const currentToken = store.getState().auth.accessToken || localStorage.getItem("accessToken");
      if (currentToken) {
        store.dispatch(logout());
      }
    }

    if (error.response && error.response.status === 503) {
      const bc = new BroadcastChannel("error_channel");
      bc.postMessage("503");
      console.warn("Service Unavailable (503) error received.");
    }

    return Promise.reject(error);
  },
);

export default instance;
