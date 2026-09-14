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
  async (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const refreshToken = store.getState().auth.refreshToken;
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
    }

    // If middleware issued a NEW refresh token — update Redux
    const newRefreshToken =
      headers["x-refresh-token"] ?? headers["X-Refresh-Token"];
    if (typeof newRefreshToken === "string") {
      store.dispatch(updateRefreshToken(newRefreshToken));
    }

    return response;
  },
  (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const msg = error.response?.data?.message || "";

      // Blacklisted/revoked → full logout
      if (msg.includes("blacklisted") || msg.includes("revoked")) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      // For all other 401 — middleware already tried refresh
      store.dispatch(logout());
    }

    if (error.response && error.response.status === 503) {
      const bc = new BroadcastChannel("error_channel");
      bc.postMessage("503");
      console.log(
        "Service Unavailable (503) error. Redirecting to error page.",
      );
    }

    return Promise.reject(error);
  },
);

export default instance;
