import api from "./api";

/** @returns {Promise<import('../contracts/resources').Notification[]>} */
export async function fetchNotifications(client_id) {
  const response = await api.get(`/api/notifications/${client_id}`);
  return response.data.data.notifications;
}

/** @returns {Promise<import('../contracts/resources').Notification>} */
export async function createNotification({ alarm_id, client_id, value, created_at }) {
  const response = await api.post("/api/notifications", { alarm_id, client_id, value, created_at });
  return response.data.data.notification;
}

export async function markNotificationRead(notification_id) {
  await api.patch(`/api/notifications/${notification_id}/read`);
}
