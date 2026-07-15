import axios from "axios";


export const saveNotification = (notification_data) => {
  axios
    .post(`http://localhost:3001/api/notification`, notification_data)
    .then((response) => {
      console.log("Notification saved:", response.data.data);
    })
    .catch((error) => {
      console.error("Saving notification error:", error);
    });
};
