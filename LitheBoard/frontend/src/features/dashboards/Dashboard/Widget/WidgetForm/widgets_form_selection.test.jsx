import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Content from "./widgets_form_selection";
import { buildEntity, buildUser } from "../../../../../test/test_utils";
import { mockProps, resetMockProps } from "../../../../../test/mock_component";

jest.mock("./widget_form.jsx", () => require("../../../../../test/mock_component").mockComponent("WidgetForm"));

const WIDGET_TYPES = ["switch", "line_chart", "bar_chart", "map", "custom_value_card"];

function renderSelection() {
  const props = {
    devices_list: [],
    setDevicesList: jest.fn(),
    returnFromWidgetFormSelection: jest.fn(),
    entities: [buildEntity()],
    setEntities: jest.fn(),
    dashboard_id: "dashboard-1",
    user: buildUser(),
  };
  const view = render(<Content {...props} />);
  const clickBack = () => fireEvent.click(view.container.querySelector('[data-icon="arrow-left"]').closest("button"));
  return { ...props, clickBack };
}

const openForm = (widgetType) => {
  const index = WIDGET_TYPES.indexOf(widgetType);
  fireEvent.click(screen.getAllByRole("button", { name: "Ver detalles" })[index]);
};

describe("<Content /> (selección de widget)", () => {
  beforeEach(resetMockProps);

  it("ofrece todos los tipos de widget", () => {
    renderSelection();

    WIDGET_TYPES.forEach((widgetType) => {
      expect(screen.getByRole("img", { name: widgetType })).toBeInTheDocument();
    });
  });

  it("abre el formulario del tipo elegido con los datos del dashboard", () => {
    const { entities, user, setDevicesList } = renderSelection();

    openForm("map");

    expect(screen.getByTestId("WidgetForm")).toBeInTheDocument();
    expect(mockProps.WidgetForm).toMatchObject({
      widget_type: "map",
      dashboard_id: "dashboard-1",
      entities,
      user,
      setDevicesList,
    });
  });

  it("vuelve a la selección desde el formulario", () => {
    const { clickBack } = renderSelection();

    openForm("switch");
    clickBack();

    expect(screen.queryByTestId("WidgetForm")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Ver detalles" })).toHaveLength(WIDGET_TYPES.length);
  });

  it("vuelve al dashboard desde la selección", () => {
    const { clickBack, returnFromWidgetFormSelection } = renderSelection();

    clickBack();

    expect(returnFromWidgetFormSelection).toHaveBeenCalledTimes(1);
  });
});
