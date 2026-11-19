import axiosInstance from "./axiosInstance";

function normalizeAuthResponse(body) {
  const payload =
    body?.response?.data ?? body?.data ?? body?.response ?? body ?? {};
  return {
    ...payload,
    message: body?.message ?? payload?.message ?? "",
  };
}

export async function loginRequest(credentials) {
  const { data } = await axiosInstance.post("/auth/login", credentials);
  return normalizeAuthResponse(data);
}

export async function signupRequest(account) {
  const { data } = await axiosInstance.post("/auth/signup", account);
  return normalizeAuthResponse(data);
}

export async function logoutRequest() {
  const { data } = await axiosInstance.post("/auth/logout");
  return normalizeAuthResponse(data);
}
