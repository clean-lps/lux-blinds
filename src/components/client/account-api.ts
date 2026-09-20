import type { NotificationDTO, ProfileDTO, UpdateProfileInput } from '@/contracts';
import { buildQuery, requestJson, type ClientPage } from './api';

export function getProfile() {
  return requestJson<ProfileDTO>('/me');
}

export function updateProfile(input: UpdateProfileInput) {
  return requestJson<ProfileDTO>('/me', { method: 'PUT', body: JSON.stringify(input) });
}

export function changePassword(input: { currentPassword: string; newPassword: string; confirmation: string }) {
  return requestJson<void>('/me/change-password', { method: 'POST', body: JSON.stringify(input) });
}

export function updateConsent(input: { channel: 'email' | 'sms'; granted: boolean; wordingVersion: string }) {
  return requestJson<void>('/me/consents', { method: 'POST', body: JSON.stringify(input) });
}

export function getNotifications(cursor?: string) {
  return requestJson<ClientPage<NotificationDTO>>(`/notifications${buildQuery({ cursor })}`);
}

export function markNotificationRead(id: string) {
  return requestJson<NotificationDTO>(`/notifications/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ read: true }) });
}

export function markAllNotificationsRead(beforeTimestamp: string) {
  return requestJson<void>('/notifications/read-all', { method: 'POST', body: JSON.stringify({ beforeTimestamp }) });
}

export function clearReadNotifications(beforeTimestamp: string) {
  return requestJson<void>('/notifications/clear-read', { method: 'POST', body: JSON.stringify({ beforeTimestamp }) });
}
