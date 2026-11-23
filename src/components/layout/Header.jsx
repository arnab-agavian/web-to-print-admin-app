import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bell, CheckCheck, LoaderCircle, LogOut, Search, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearNotificationError,
  deleteNotification,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../redux/slices/notificationSlice';
import { AppSearchInput } from '../ui/AppFields';

function notificationTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const ranges = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return relativeTime.format(Math.round(seconds / secondsInUnit), unit);
    }
  }
  return 'just now';
}

function notificationType(value) {
  return String(value || 'notification').replace(/[_-]+/g, ' ');
}

export default function Header({ search, setSearch, onLogout, loggingOut }) {
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    items,
    unreadCount,
    fetchStatus,
    mutationStatus,
    fetchError,
    mutationError,
    mutatingId,
    mutationKind,
  } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchUnreadNotificationCount());
  }, [dispatch]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [notificationsOpen]);

  const toggleNotifications = () => {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    if (opening) {
      dispatch(clearNotificationError());
      dispatch(fetchNotifications({ limit: 20, offset: 0 }));
      dispatch(fetchUnreadNotificationCount());
    }
  };

  const openNotification = (notification) => {
    if (!notification.isRead && mutationStatus !== 'loading') {
      dispatch(markNotificationRead(notification.id));
    }
  };

  const removeNotification = (event, notificationId) => {
    event.stopPropagation();
    if (mutationStatus !== 'loading') dispatch(deleteNotification(notificationId));
  };

  return (
    <header className="admin-header">
      <div className="global-search"><Search /><AppSearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders, customers, products..." inputProps={{ 'aria-label': 'Search orders, customers, and products' }} /><kbd>⌘ K</kbd></div>
      <div className="header-actions">
        <div className="notification-menu" ref={menuRef}>
          <button className={`round-btn notification-trigger ${notificationsOpen ? 'active' : ''}`} type="button" onClick={toggleNotifications} aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'} aria-expanded={notificationsOpen} aria-controls="notification-dropdown">
            <Bell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          {notificationsOpen && (
            <section id="notification-dropdown" className="notification-dropdown" aria-label="Notifications">
              <div className="notification-head">
                <div><h2>Notifications</h2><span>{unreadCount ? `${unreadCount} unread` : 'You are all caught up'}</span></div>
                {unreadCount > 0 && (
                  <button type="button" onClick={() => dispatch(markAllNotificationsRead())} disabled={mutationStatus === 'loading'}>
                    {mutatingId === 'all' ? <LoaderCircle className="spin" /> : <CheckCheck />}Mark all read
                  </button>
                )}
              </div>
              {(fetchError || mutationError) && (
                <div className="notification-error" role="alert">
                  <AlertCircle /><span>{mutationError || fetchError}</span>
                  {fetchError && <button type="button" onClick={() => dispatch(fetchNotifications({ limit: 20, offset: 0 }))}>Retry</button>}
                </div>
              )}
              <div className="notification-list" aria-live="polite">
                {fetchStatus === 'loading' && items.length === 0 && <div className="notification-state"><LoaderCircle className="spin" /><span>Loading notifications…</span></div>}
                {fetchStatus !== 'loading' && !fetchError && items.length === 0 && <div className="notification-state"><Bell /><strong>No notifications yet</strong><span>New updates will appear here.</span></div>}
                {items.map((notification) => (
                  <article className={`notification-item ${notification.isRead ? '' : 'unread'}`} key={notification.id}>
                    <button className="notification-content" type="button" onClick={() => openNotification(notification)} disabled={mutationStatus === 'loading'} aria-label={`${notification.isRead ? '' : 'Unread: '}${notification.title}`}>
                      <span className="notification-type-icon"><Bell /></span>
                      <span className="notification-copy">
                        <span className="notification-meta"><em>{notificationType(notification.type)}</em><time dateTime={notification.createdAt || undefined} title={notification.createdAt ? new Date(notification.createdAt).toLocaleString() : undefined}>{notificationTime(notification.createdAt)}</time></span>
                        <strong>{notification.title}</strong>
                        {notification.message && <span>{notification.message}</span>}
                      </span>
                      {!notification.isRead && <i aria-hidden="true" />}
                    </button>
                    <button className="notification-delete" type="button" onClick={(event) => removeNotification(event, notification.id)} disabled={mutationStatus === 'loading'} aria-label={`Delete ${notification.title}`} title="Delete notification">
                      {mutationKind === 'delete' && mutatingId === notification.id && mutationStatus === 'loading' ? <LoaderCircle className="spin" /> : <Trash2 />}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
        <button className="round-btn" type="button" onClick={onLogout} disabled={loggingOut} aria-label={loggingOut ? 'Signing out' : 'Sign out'} aria-busy={loggingOut} title={loggingOut ? 'Signing out…' : 'Sign out'}><LogOut /></button>
      </div>
    </header>
  );
}
