import { createNotification } from "../services/notifications_service";

// Legacy fire-and-forget adapter: keep logging failures for existing callers.
export const saveNotification = (notification) => createNotification(notification)
  .then((created_notification) => {
    console.log("Notification saved:", created_notification);
    return created_notification;
  })
  .catch((error) => {
    console.error("Saving notification error:", error);
  });