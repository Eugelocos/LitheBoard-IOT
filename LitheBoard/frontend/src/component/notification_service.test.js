import api from "../services/api";
import { waitFor } from "@testing-library/react";
import { saveNotification } from "./notification_service";

jest.mock("../services/api");

const notification = { alarm_id: "alarm-1", value: 35 };

describe("saveNotification", () => {
  it("envía la notificación al backend", async () => {
    api.post.mockResolvedValue({ data: { data: { notification: { notification_id: "n-1" } } } });

    saveNotification(notification);

    expect(api.post).toHaveBeenCalledWith(`/api/notifications`, notification);
    await waitFor(() => expect(console.log).toHaveBeenCalledWith("Notification saved:", { notification_id: "n-1" }));
  });

  it("registra el error sin lanzarlo", async () => {
    const error = new Error("fail");
    api.post.mockRejectedValue(error);

    expect(() => saveNotification(notification)).not.toThrow();
    await waitFor(() => expect(console.error).toHaveBeenCalledWith("Saving notification error:", error));
  });
});
