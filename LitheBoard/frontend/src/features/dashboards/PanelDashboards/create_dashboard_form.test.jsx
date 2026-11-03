import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import api from "../../../services/api";
import CreateDashboardForm from "./create_dashboard_form";
import { buildUser, httpError, setAuthenticatedUser } from "../../../test/test_utils";

jest.mock("../../../services/api");

const existing = [{ dashboard_id: "d-1", name: "Planta", description: "Sensores" }];

function renderForm() {
  const setDashboards = jest.fn();
  render(<CreateDashboardForm dashboards={existing} setDashboards={setDashboards} />);
  return { setDashboards };
}

function fillAndSubmit({ name = "Invernadero", description = "Humedad y temperatura" } = {}) {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: description } });
  fireEvent.click(screen.getByRole("button", { name: "Create Dashboard" }));
}

describe("<CreateDashboardForm />", () => {
  let user;

  beforeEach(() => {
    user = setAuthenticatedUser(buildUser({ id: "client-42" }));
  });

  it("exige nombre y descripción", () => {
    renderForm();

    expect(screen.getByLabelText("Name")).toBeRequired();
    expect(screen.getByLabelText("Description")).toBeRequired();
  });

  it("crea el dashboard, lo añade a la lista y limpia el formulario", async () => {
    const created = { dashboard_id: "d-2", name: "Invernadero", description: "Humedad y temperatura" };
    api.post.mockResolvedValue({ data: { data: { dashboard: created } } });
    const { setDashboards } = renderForm();

    fillAndSubmit();

    await waitFor(() => expect(setDashboards).toHaveBeenCalledWith([...existing, created]));
    expect(api.post).toHaveBeenCalledWith("/api/dashboards", {
      name: "Invernadero",
      description: "Humedad y temperatura",
      client_id: user.client_id,
    });
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
  });

  it("conserva los datos y no modifica la lista si la creación falla", async () => {
    api.post.mockRejectedValue(httpError(500));
    const { setDashboards } = renderForm();

    fillAndSubmit();

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(setDashboards).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Name")).toHaveValue("Invernadero");
  });
});
