import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import LateralMenu from "./lateral_menu";
import { buildDashboard, buildUser } from "../../../test/test_utils";

const dashboards = [
  buildDashboard({ dashboard_id: "d-1", name: "Planta" }),
  buildDashboard({ dashboard_id: "d-2", name: "Oficina" }),
];

function renderMenu(user = buildUser()) {
  const handleSwitchSection = jest.fn();
  render(<LateralMenu handleSwitchSection={handleSwitchSection} dashboards={dashboards} user={user} />);
  return { handleSwitchSection };
}

const clickItem = (name) => fireEvent.click(screen.getByText(name).closest('[role="button"], button'));

describe("<LateralMenu />", () => {
  it("lista los dashboards del usuario", () => {
    renderMenu();

    expect(screen.getByText("Planta")).toBeInTheDocument();
    expect(screen.getByText("Oficina")).toBeInTheDocument();
  });

  it("abre el dashboard seleccionado", () => {
    const { handleSwitchSection } = renderMenu();

    clickItem("Oficina");

    expect(handleSwitchSection).toHaveBeenCalledWith("dashboards", dashboards[1]);
  });

  it("abre la lista de dashboards y pliega el submenú", () => {
    const { handleSwitchSection } = renderMenu();
    expect(screen.getByTestId("ExpandLessIcon")).toBeInTheDocument();

    clickItem("Dashboards");

    expect(handleSwitchSection).toHaveBeenCalledWith("dashboard-list");
    expect(screen.getByTestId("ExpandMoreIcon")).toBeInTheDocument();
  });

  it.each([
    ["Entities", "devices-list"],
    ["Alarms", "alarms-list"],
    ["Rulechain", "rulechain-editor"],
    ["Profile", "profile-settings"],
  ])("la sección %s navega a '%s'", (label, section) => {
    const { handleSwitchSection } = renderMenu();

    clickItem(label);

    expect(handleSwitchSection).toHaveBeenCalledWith(section);
  });

  it("muestra los clientes asociados solo a administradores", () => {
    const { handleSwitchSection } = renderMenu(buildUser({ role: "admin" }));

    clickItem("Associated clients");

    expect(handleSwitchSection).toHaveBeenCalledWith("clients-settings");
  });

  it("oculta los clientes asociados a usuarios comunes", () => {
    renderMenu(buildUser({ role: "client" }));

    expect(screen.queryByText("Associated clients")).not.toBeInTheDocument();
  });
});
