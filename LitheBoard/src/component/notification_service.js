import axios from "axios";

// Función para guardar notificaciones
export const saveNotification = (notificationData) => {
  axios
    .post("http://localhost:3001/api/notifications/insert", notificationData)
    .then((response) => {
      console.log("Notificación guardada:", response.data);
    })
    .catch((error) => {
      console.error("Error al guardar la notificación:", error);
    });
};
