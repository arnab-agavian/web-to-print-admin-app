import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteNotificationRequest,
  getNotificationsRequest,
  getUnreadNotificationCountRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from '../api/notificationApi';

function apiError(error) {
  return error.response?.data?.message
    || error.response?.data?.error?.message
    || error.message
    || 'Something went wrong. Please try again.';
}

function normalizeNotification(notification, index) {
  const readAt = notification.readAt ?? notification.read_at ?? null;
  const rawReadState = notification.isRead ?? notification.is_read ?? notification.read ?? readAt;
  const isRead = rawReadState === true || rawReadState === 1 || rawReadState === 'true' || Boolean(readAt);
  return {
    ...notification,
    id: notification.id ?? notification.notificationId ?? notification._id ?? `notification-${index}`,
    type: notification.type ?? 'notification',
    title: notification.title ?? notification.subject ?? 'Notification',
    message: notification.message ?? notification.body ?? notification.description ?? '',
    createdAt: notification.createdAt ?? notification.created_at ?? notification.timestamp ?? null,
    readAt,
    isRead,
  };
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (query = {}, { rejectWithValue }) => {
    try {
      const result = await getNotificationsRequest(query);
      return {
        ...result,
        notifications: result.notifications.map(normalizeNotification),
      };
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
  {
    condition: (_, { getState }) => getState().notifications.fetchStatus !== 'loading',
  },
);

export const fetchUnreadNotificationCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await getUnreadNotificationCountRequest();
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
  {
    condition: (_, { getState }) => getState().notifications.countStatus !== 'loading',
  },
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await markNotificationReadRequest(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsReadRequest();
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      await deleteNotificationRequest(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(apiError(error));
    }
  },
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    total: 0,
    unreadCount: 0,
    fetchStatus: 'idle',
    countStatus: 'idle',
    mutationStatus: 'idle',
    fetchError: null,
    mutationError: null,
    mutatingId: null,
    mutationKind: null,
  },
  reducers: {
    clearNotificationError(state) {
      state.fetchError = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications;
        state.total = action.payload.total;
        state.fetchStatus = 'succeeded';
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.fetchStatus = 'failed';
        state.fetchError = action.payload || 'Unable to load notifications.';
      })
      .addCase(fetchUnreadNotificationCount.pending, (state) => {
        state.countStatus = 'loading';
      })
      .addCase(fetchUnreadNotificationCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
        state.countStatus = 'succeeded';
      })
      .addCase(fetchUnreadNotificationCount.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.countStatus = 'failed';
      })
      .addCase(markNotificationRead.pending, (state, action) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
        state.mutatingId = action.meta.arg;
        state.mutationKind = 'read';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.items.find((item) => item.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.mutationStatus = 'succeeded';
        state.mutatingId = null;
        state.mutationKind = null;
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
        state.mutatingId = 'all';
        state.mutationKind = 'read-all';
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        const now = new Date().toISOString();
        state.items.forEach((notification) => {
          notification.isRead = true;
          notification.readAt ??= now;
        });
        state.unreadCount = 0;
        state.mutationStatus = 'succeeded';
        state.mutatingId = null;
        state.mutationKind = null;
      })
      .addCase(deleteNotification.pending, (state, action) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
        state.mutatingId = action.meta.arg;
        state.mutationKind = 'delete';
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.items.find((item) => item.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        state.mutationStatus = 'succeeded';
        state.mutatingId = null;
        state.mutationKind = null;
      })
      .addMatcher(
        (action) => [markNotificationRead.rejected.type, markAllNotificationsRead.rejected.type, deleteNotification.rejected.type].includes(action.type),
        (state, action) => {
          state.mutationStatus = 'failed';
          state.mutationError = action.payload || 'Unable to update the notification.';
          state.mutatingId = null;
          state.mutationKind = null;
        },
      );
  },
});

export const { clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;
