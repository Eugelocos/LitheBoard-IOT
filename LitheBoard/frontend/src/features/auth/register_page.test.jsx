import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import api from "../../services/api";
import Register from "./register_page";
import { httpError, renderWithRouter } from "../../test/test_utils";

jest.mock("../../services/api");

const REGISTER_URL = `/api/clients/register`;

const getNameInput = () => screen.getByLabelText(/^nombre/i);
const getEmailInput = () => screen.getByLabelText(/^correo electrónico(?! del)/i);
const getPasswordInput = () => screen.getByLabelText(/^contraseña/i);
const queryAdminEmailInput = () =>
  screen.queryByLabelText(/correo electrónico del administrador/i);

function fillForm({ name = "Ana", email = "ana@example.com", password = "secreta123", admin_email } = {}) {
  fireEvent.change(getNameInput(), { target: { value: name } });
  fireEvent.change(getEmailInput(), { target: { value: email } });
  fireEvent.change(getPasswordInput(), { target: { value: password } });
  if (admin_email !== undefined) {
    fireEvent.change(queryAdminEmailInput(), { target: { value: admin_email } });
  }
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: "Register" }));

const renderRegister = () => renderWithRouter(<Register />, { route: "/register" });

describe("<Register />", () => {
  it("muestra por defecto el campo de email del administrador", () => {
    renderRegister();
    expect(screen.getByRole("checkbox", { name: "Admin" })).not.toBeChecked();
    expect(queryAdminEmailInput()).toBeInTheDocument();
  });

  it("oculta y vuelve a mostrar el email del administrador al alternar 'Admin'", () => {
    renderRegister();
    const adminCheckbox = screen.getByRole("checkbox", { name: "Admin" });

    fireEvent.click(adminCheckbox);
    expect(queryAdminEmailInput()).not.toBeInTheDocument();

    fireEvent.click(adminCheckbox);
    expect(queryAdminEmailInput()).toBeInTheDocument();
  });

  it("registra un usuario común con nivel de acceso 2", async () => {
    renderRegister();
    api.post.mockResolvedValue({ data: { data: { client: { client_id: "new-client" } } } });

    fillForm({ admin_email: "admin@example.com" });
    submit();

    expect(await screen.findByText(/registro exitoso/i)).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith(REGISTER_URL, {
      name: "Ana",
      email: "ana@example.com",
      password: "secreta123",
      admin_email: "admin@example.com",
      role: "client",
    });
    expect(screen.queryByRole("button", { name: "Register" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute("href", "/login");
  });

  it("registra un administrador con nivel de acceso 1", async () => {
    renderRegister();
    api.post.mockResolvedValue({ data: { data: { client: { client_id: "new-client" } } } });

    fireEvent.click(screen.getByRole("checkbox", { name: "Admin" }));
    fillForm();
    submit();

    expect(await screen.findByText(/registro exitoso/i)).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith(
      REGISTER_URL,
      expect.objectContaining({ role: "admin" }),
    );
  });

  it("mantiene el formulario disponible si el registro falla", async () => {
    renderRegister();
    api.post.mockRejectedValue(httpError(500, { message: "Email ya registrado" }));

    fillForm();
    submit();

    await screen.findByRole("button", { name: "Register" });
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/registro exitoso/i)).not.toBeInTheDocument();
  });
});
