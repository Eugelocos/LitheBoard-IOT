import axios from "axios";


export const saveNotification = (notification_data) => {
  axios
    .post(`http://litheboard-backend:3001/api/notifications/insert`, notification_data)
    .then((response) => {
      console.log("Notification saved:", response.data);
    })
    .catch((error) => {
      console.error("Saving notification error:", error);
    });
};
