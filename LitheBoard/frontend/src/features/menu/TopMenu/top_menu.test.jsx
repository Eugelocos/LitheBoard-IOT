import React, { useState } from "react";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import api from "../../../services/api";
import TopMenu from "./top_menu";
import {
  buildNotification,
  buildUser,
  clickIconButton,
  renderWithRouter,
  setAuthenticatedUser,
} from "../../../test/test_utils";

jest.mock("../../../services/api");

const unseen = buildNotification({ alarm_key: "temp", device_name: "Sensor Temperatura", alarm_value: 30, value: 35 });
const seen = buildNotification({ notification_id: "n-2", is_read: true, created_at: "2026-09-30T08:00:00.000Z" });

function Harness({ user, toggleMenu, handleSwitchSection, initialNotifications }) {
  const [all, setAll] = useState(initialNotifications);
  const [unseenList, setUnseen] = useState(initialNotifications.filter((n) => !n.is_read));
  return (
    <TopMenu
      user={user}
      toggleMenu={toggleMenu}
      handleSwitchSection={handleSwitchSection}
      alarms={[]}
      all_notifications={all}
      setAllNotifications={setAll}
      unseen_notifications={unseenList}
      setUnseenNotifications={setUnseen}
    />
  );
}

function renderTopMenu({ user = buildUser(), notifications = [unseen, seen] } = {}) {
  const props = { toggleMenu: jest.fn(), handleSwitchSection: jest.fn() };
  renderWithRouter(<Harness user={user} initialNotifications={notifications} {...props} />, {
    route: "/dashboard",
    extraRoutes: { "/login": <div>Login</div> },
  });
  return props;
}

const openNotifications = () => clickIconButton("NotificationsIcon");
const openUserMenu = () => fireEvent.click(screen.getByRole("button", { name: "account of current user" }));

describe("<TopMenu />", () => {
  it("muestra un indicador de carga mientras no hay usuario", () => {
    renderTopMenu({ user: null });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("muestra los datos del usuario y la cantidad de notificaciones sin leer", () => {
    renderTopMenu();

    const appBar = within(screen.getByRole("banner"));
    expect(appBar.getByText("Welcome, Test User")).toBeInTheDocument();
    expect(appBar.getByText("user@example.com")).toBeInTheDocument();
    expect(appBar.getByText("1")).toHaveClass("MuiBadge-badge");
  });

  it("abre el menú lateral", () => {
    const { toggleMenu } = renderTopMenu();

    fireEvent.click(screen.getByRole("button", { name: "menu" }));

    expect(toggleMenu).toHaveBeenCalledTimes(1);
  });

  it("describe cada notificación pendiente", () => {
    renderTopMenu();

    openNotifications();

    const item = screen.getByText(unseen.created_at).closest("li");
    expect(item).toHaveTextContent(
      "The value of the key temp of the device Sensor Temperatura has exceeded 30 and reached 35.",
    );
  });

  it("marca una notificación como leída", async () => {
    api.patch.mockResolvedValue({ data: {} });
    renderTopMenu();

    openNotifications();
    fireEvent.click(screen.getByText(unseen.created_at).closest("li"));

    expect(await screen.findByText("No new notifications.")).toBeInTheDocument();
    expect(api.patch).toHaveBeenCalledWith(`/api/notifications/n-1/read`);
  });

  it("indica cuando no hay notificaciones nuevas", () => {
    renderTopMenu({ notifications: [] });

    openNotifications();

    expect(screen.getByText("No new notifications.")).toBeInTheDocument();
  });

  it("despliega el historics de notificaciones leídas", () => {
    renderTopMenu();

    openNotifications();
    fireEvent.click(screen.getByText("Notifications"));

    expect(screen.getByText(seen.created_at)).toBeInTheDocument();
  });

  it("usa notification_id al marcar una notificación del historics", async () => {
    api.patch.mockResolvedValue({ data: {} });
    renderTopMenu();

    openNotifications();
    fireEvent.click(screen.getByText("Notifications"));
    fireEvent.click(screen.getByText(seen.created_at));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(`/api/notifications/n-2/read`));
  });

  it("muestra las iniciales del usuario en su menú", () => {
    renderTopMenu();

    openUserMenu();

    const menu = screen.getByRole("menu");
    expect(within(menu).getByText("TU")).toBeInTheDocument();
    expect(within(menu).getByText("Test User")).toBeInTheDocument();
  });

  it("abre la configuración del perfil", () => {
    const { handleSwitchSection } = renderTopMenu();

    openUserMenu();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(handleSwitchSection).toHaveBeenCalledWith("profile-settings");
  });

  it("cierra sesión, borra la sesión local y vuelve al login", async () => {
    setAuthenticatedUser();
    api.post.mockResolvedValue({ data: {} });
    renderTopMenu();

    openUserMenu();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/login"));
    expect(api.post).toHaveBeenCalledWith(`/api/clients/logout`, {}, { withCredentials: true });
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("mantiene la sesión si el logout falla", async () => {
    setAuthenticatedUser();
    api.post.mockRejectedValue(new Error("fail"));
    renderTopMenu();

    openUserMenu();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    expect(localStorage.getItem("token")).not.toBeNull();
  });
});
