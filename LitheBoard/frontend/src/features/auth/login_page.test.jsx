import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import api from "../../services/api";
import Login from "./login_page";
import {
  buildUser,
  deferred,
  apiError,
  renderWithRouter,
} from "../../test/test_utils";

jest.mock("../../services/api");

const LOGIN_URL = `/api/clients/login`;

/** Respuesta del login: data.session con el token y el cliente. */
const loginResponse = (client = buildUser(), token = "t") => ({
  data: { status: "success", data: { session: { client, token } }, error: null },
});

function renderLogin() {
  return renderWithRouter(<Login />, {
    route: "/login",
    extraRoutes: { "/dashboard": <div>Dashboard</div> },
  });
}

const expectRedirectTo = (pathname) =>
  waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(pathname));

function fillAndSubmit({ email = "user@example.com", password = "password123" } = {}) {
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/contraseña/i), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
}

describe("<Login />", () => {
  it("renderiza el formulario con los campos requeridos", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeRequired();
    expect(screen.getByLabelText(/contraseña/i)).toBeRequired();
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute("type", "password");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/register");
  });

  it("guarda la sesión y redirige al dashboard cuando el login es correcto", async () => {
    const client = buildUser();
    api.post.mockResolvedValue(loginResponse(client, "jwt-123"));
    renderLogin();

    fillAndSubmit({ email: client.email });

    await expectRedirectTo("/dashboard");
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(LOGIN_URL, {
      email: client.email,
      password: "password123",
    });
    expect(localStorage.getItem("token")).toBe("jwt-123");
    expect(JSON.parse(localStorage.getItem("user"))).toEqual(client);
  });

  it("elimina los espacios de la contraseña antes de enviarla", async () => {
    api.post.mockResolvedValue(loginResponse());
    renderLogin();

    fillAndSubmit({ password: "  secreta  " });

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(LOGIN_URL, expect.objectContaining({ password: "secreta" })),
    );
  });

  it("muestra el estado de carga y evita envíos duplicados mientras espera", async () => {
    const request = deferred();
    api.post.mockReturnValue(request.promise);
    renderLogin();

    fillAndSubmit();

    const button = await screen.findByRole("button", { name: "Loading..." });
    expect(button).toBeDisabled();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    fireEvent.submit(button.closest("form"));
    expect(api.post).toHaveBeenCalledTimes(1);

    request.resolve(loginResponse());
    await expectRedirectTo("/dashboard");
  });

  it("muestra error y no guarda sesión cuando las credenciales son incorrectas", async () => {
    api.post.mockRejectedValue(apiError(401, "INVALID_CREDENTIALS", "Email o contraseña inválidos"));
    renderLogin();

    fillAndSubmit({ password: "incorrecta" });

    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeEnabled();
    expect(screen.getByTestId("location")).toHaveTextContent("/login");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("alterna la visibilidad de la contraseña", () => {
    renderLogin();
    const password = screen.getByLabelText(/contraseña/i);

    fireEvent.click(screen.getByTestId("VisibilityIcon").closest("button"));
    expect(password).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByTestId("VisibilityOffIcon").closest("button"));
    expect(password).toHaveAttribute("type", "password");
  });
});
