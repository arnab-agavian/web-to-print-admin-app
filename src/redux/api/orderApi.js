import axiosInstance from "./axiosInstance";

function responseData(body) {
  return body?.response?.data ?? body?.data ?? body?.response ?? body;
}

export async function getOrdersRequest({ status, q, limit = 50, offset = 0 } = {}) {
  const { data } = await axiosInstance.get("/admin/jobs", {
    params: {
      ...(status ? { status } : {}),
      ...(q?.trim() ? { q: q.trim() } : {}),
      limit,
      offset,
    },
  });
  const result = responseData(data);
  const jobs = Array.isArray(result)
    ? result
    : result?.jobs ?? result?.orders ?? result?.items ?? result?.results ?? result?.rows ?? [];
  return {
    jobs: Array.isArray(jobs) ? jobs : [],
    total: Number(result?.total ?? jobs.length) || 0,
    limit,
    offset,
  };
}

export async function updateJobStatusRequest(jobId, status) {
  const { data } = await axiosInstance.put(
    `/admin/jobs/${encodeURIComponent(jobId)}/status`,
    { status },
  );
  return responseData(data);
}

function downloadName(headers, fallback) {
  const disposition = headers?.['content-disposition'] ?? '';
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const value = utf8Name ? decodeURIComponent(utf8Name) : plainName;
  return value || fallback;
}

export async function getProductionFileRequest(jobId, fallbackName) {
  const response = await axiosInstance.get(
    `/admin/jobs/${encodeURIComponent(jobId)}/production-file`,
    { responseType: 'blob' },
  );
  return {
    blob: response.data,
    filename: downloadName(response.headers, fallbackName || `${jobId}-production.pdf`),
  };
}

export async function getAdminAnalyticsRequest() {
  const { data } = await axiosInstance.get('/admin/analytics');
  return responseData(data) ?? {};
}

export async function uploadProofPreviewRequest(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", "proofs");
  const { data } = await axiosInstance.post("/files/upload", formData, {
    headers: { "Content-Type": undefined },
  });
  return responseData(data);
}

export async function createOrderProofRequest(orderId, proof) {
  const { data } = await axiosInstance.post(
    `/proofs/orders/${encodeURIComponent(orderId)}`,
    { previewPath: proof.previewPath, notes: proof.notes },
  );
  return responseData(data);
}

export async function approveProofRequest(proofId) {
  const { data } = await axiosInstance.post(
    `/proofs/${encodeURIComponent(proofId)}/approve`,
  );
  return responseData(data);
}

export async function requestProofChangesRequest(proofId, message) {
  const { data } = await axiosInstance.post(
    `/proofs/${encodeURIComponent(proofId)}/change-request`,
    { message },
  );
  return responseData(data);
}
