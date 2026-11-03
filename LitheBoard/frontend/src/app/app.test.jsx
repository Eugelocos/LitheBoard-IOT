import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import api from "../services/api";
import App from "./app";
import { buildUser, setAuthenticatedUser } from "../test/test_utils";

jest.mock("../services/api");
jest.mock("../features/app/main_panel.jsx", () => () => (
  <div>Dashboard de prueba</div>
));

function renderAt(path) {
  window.history.replaceState({}, "", path);
  return render(<App />);
}

const findLoginHeading = () => screen.findByRole("heading", { name: "Login" });

describe("App routing", () => {
  describe("sin sesión", () => {
    it("redirige la raíz al login", async () => {
      renderAt("/");

      expect(await findLoginHeading()).toBeInTheDocument();
      expect(window.location.pathname).toBe("/login");
    });

    it("protege /dashboard redirigiendo al login", async () => {
      renderAt("/dashboard");

      expect(await findLoginHeading()).toBeInTheDocument();
      expect(screen.queryByText("Dashboard de prueba")).not.toBeInTheDocument();
      expect(window.location.pathname).toBe("/login");
    });

    it("envía las rutas desconocidas al login pasando por /dashboard", async () => {
      renderAt("/ruta/inexistente");

      expect(await findLoginHeading()).toBeInTheDocument();
      expect(window.location.pathname).toBe("/login");
    });

    it("permite acceder al registro sin autenticación", () => {
      renderAt("/register");

      expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
    });
  });

  describe("con sesión", () => {
    beforeEach(() => setAuthenticatedUser());

    it("muestra el dashboard en /dashboard", async () => {
      renderAt("/dashboard");

      expect(await screen.findByText("Dashboard de prueba")).toBeInTheDocument();
    });

    it("redirige las rutas desconocidas al dashboard", async () => {
      renderAt("/ruta/inexistente");

      expect(await screen.findByText("Dashboard de prueba")).toBeInTheDocument();
      expect(window.location.pathname).toBe("/dashboard");
    });
  });

  describe("flujos de navegación", () => {
    it("inicia sesión y abre el dashboard", async () => {
      const client = buildUser();
      api.post.mockResolvedValue({ data: { status: "success", data: { session: { client, token: "jwt" } }, error: null } });
      renderAt("/login");

      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: client.email },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Login" }));

      expect(await screen.findByText("Dashboard de prueba")).toBeInTheDocument();
      expect(api.post).toHaveBeenCalledWith(`/api/clients/login`, {
        email: client.email,
        password: "password123",
      });
    });

    it("navega del login al registro con el enlace 'Sign up'", async () => {
      renderAt("/login");

      fireEvent.click(await screen.findByRole("link", { name: "Sign up" }));

      expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
      expect(window.location.pathname).toBe("/register");
    });
  });
});
