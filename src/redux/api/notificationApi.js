import axiosInstance from './axiosInstance';

function responseData(body) {
  return body?.response?.data ?? body?.data ?? body?.response ?? body;
}

export async function getNotificationsRequest({ limit = 20, offset = 0, unreadOnly = false, type } = {}) {
  const { data } = await axiosInstance.get('/notifications', {
    params: {
      limit,
      offset,
      unreadOnly,
      ...(type ? { type } : {}),
    },
  });
  const result = responseData(data);
  const notifications = Array.isArray(result)
    ? result
    : result?.notifications ?? result?.items ?? result?.results ?? [];

  return {
    notifications: Array.isArray(notifications) ? notifications : [],
    total: Number(result?.total ?? result?.count ?? notifications.length) || 0,
    limit,
    offset,
  };
}

export async function getUnreadNotificationCountRequest() {
  const { data } = await axiosInstance.get('/notifications/unread-count');
  const result = responseData(data);
  return Number(
    typeof result === 'number'
      ? result
      : result?.unreadCount ?? result?.unread_count ?? result?.unread ?? result?.count ?? result?.total ?? 0,
  ) || 0;
}

export async function markAllNotificationsReadRequest() {
  const { data } = await axiosInstance.patch('/notifications/read-all');
  return responseData(data);
}

export async function markNotificationReadRequest(notificationId) {
  const { data } = await axiosInstance.patch(`/notifications/${encodeURIComponent(notificationId)}/read`);
  return responseData(data);
}

export async function deleteNotificationRequest(notificationId) {
  const { data } = await axiosInstance.delete(`/notifications/${encodeURIComponent(notificationId)}`);
  return responseData(data);
}
