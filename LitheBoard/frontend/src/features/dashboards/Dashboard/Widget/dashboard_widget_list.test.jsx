import React from "react";
import { render, screen } from "@testing-library/react";
import DeviceWidgetList from "./dashboard_widget_list";
import { buildDevice } from "../../../../test/test_utils";

jest.mock("./dashboard_widget_card.jsx", () => ({ device, index, toggleSwitchState }) => (
  <div data-testid="card" data-index={index} data-has-toggle={String(typeof toggleSwitchState === "function")}>
    {device.name}
  </div>
));

describe("<DeviceWidgetList />", () => {
  it("renderiza una tarjeta por widget pasando los callbacks", () => {
    const devices = [buildDevice(), buildDevice({ widget_id: "widget-2", name: "Humedad" })];

    render(<DeviceWidgetList devices_list={devices} toggleSwitchState={jest.fn()} />);

    const cards = screen.getAllByTestId("card");
    expect(cards.map((card) => card.textContent)).toEqual(["Temperatura", "Humedad"]);
    expect(cards[1]).toHaveAttribute("data-index", "1");
    expect(cards[0]).toHaveAttribute("data-has-toggle", "true");
  });

  it("no renderiza nada sin widgets", () => {
    render(<DeviceWidgetList devices_list={[]} />);

    expect(screen.queryByTestId("card")).not.toBeInTheDocument();
  });
});
