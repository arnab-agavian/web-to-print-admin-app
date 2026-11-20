import axios from "axios";
import { getAccessToken, getValidAccessToken, removeAccessToken } from "./tokenCookie";

const apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL is missing. Add it to .env.local and restart the Vite server.");
}

const axiosInstance = axios.create({
  baseURL: apiBaseUrl.replace(/\/$/, ""),
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const hadSession = Boolean(getAccessToken());
  const accessToken = getValidAccessToken();
  if (hadSession && !accessToken) window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadSession = Boolean(getAccessToken());
    if (error.response?.status === 401 && hadSession) {
      removeAccessToken();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
