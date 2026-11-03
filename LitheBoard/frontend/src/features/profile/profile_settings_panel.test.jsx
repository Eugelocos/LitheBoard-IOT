import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import api from "../../services/api";
import ProfileSettingsPanel from "./profile_settings_panel ";
import { buildUser } from "../../test/test_utils";

jest.mock("../../services/api");

const user = buildUser();

function renderPanel() {
  const handleLogout = jest.fn();
  render(<ProfileSettingsPanel user={user} handleLogout={handleLogout} />);
  return { handleLogout };
}

describe("<ProfileSettingsPanel />", () => {
  it("precarga nombre y email del usuario", () => {
    renderPanel();

    expect(screen.getByLabelText("Name")).toHaveValue(user.name);
    expect(screen.getByLabelText("Email")).toHaveValue(user.email);
  });

  it("guarda el perfil y muestra el mensaje del backend", async () => {
    api.put.mockResolvedValue({
      data: { status: "success", data: { client: { client_id: user.client_id, name: "Nuevo Nombre", email: "nuevo@example.com" } }, error: null },
    });
    renderPanel();

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Nuevo Nombre" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nuevo@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Profile updated.")).toBeInTheDocument();
    expect(api.put).toHaveBeenCalledWith(`/api/clients`, {
      client_id: user.client_id,
      name: "Nuevo Nombre",
      email: "nuevo@example.com",
    });
  });

  it("muestra un error si no se puede guardar", async () => {
    api.put.mockRejectedValue(new Error("fail"));
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Error updating profile.")).toBeInTheDocument();
  });

  it("delega el cierre de sesión", () => {
    const { handleLogout } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});
