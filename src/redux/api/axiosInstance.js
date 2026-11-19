import axios from "axios";
import { getAccessToken } from "./tokenCookie";

const apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL is missing. Add it to .env.local and restart the Vite server.");
}

const axiosInstance = axios.create({
  baseURL: apiBaseUrl.replace(/\/$/, ""),
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export default axiosInstance;
