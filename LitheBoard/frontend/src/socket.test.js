import { io } from "socket.io-client";
import config from "@config";

jest.mock("socket.io-client", () => ({ io: jest.fn(() => ({ id: "socket" })) }));

describe("socket", () => {
  it("se conecta al puerto WebSocket del backend con credenciales", () => {
    jest.isolateModules(() => {
      io.mockReturnValue({ id: "socket" });
      const socket = require("./socket").default;

      expect(socket).toEqual({ id: "socket" });
    });

    expect(io).toHaveBeenCalledWith(
      `${config.BACKEND_URL}:${config.BACKEND_WS_PORT}`,
      expect.objectContaining({ credentials: true }),
    );
  });
});
