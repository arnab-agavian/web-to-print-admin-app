import axiosInstance from './axiosInstance';

function responseData(body) {
  return body?.response?.data ?? body?.data ?? body?.response ?? body;
}

export async function getAdminCustomersRequest({ q, limit = 50, offset = 0 } = {}) {
  const { data } = await axiosInstance.get('/admin/customers', {
    params: {
      ...(q?.trim() ? { q: q.trim() } : {}),
      limit,
      offset,
    },
  });
  const result = responseData(data);
  const customers = Array.isArray(result) ? result : result?.customers ?? [];
  return {
    customers: Array.isArray(customers) ? customers : [],
    total: Number(result?.total ?? customers.length) || 0,
    limit,
    offset,
  };
}
