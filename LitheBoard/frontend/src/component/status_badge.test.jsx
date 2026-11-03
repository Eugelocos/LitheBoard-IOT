import React from "react";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./status_badge";

describe("<StatusBadge />", () => {
  it.each([0, undefined, 99])("no muestra nada para el estado %p", (status) => {
    render(<StatusBadge status={status} />);

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Success")).not.toBeInTheDocument();
    expect(screen.queryByText("Error")).not.toBeInTheDocument();
  });

  it("muestra un indicador de progreso mientras carga (1)", () => {
    render(<StatusBadge status={1} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("muestra el estado de éxito (2)", () => {
    render(<StatusBadge status={2} />);

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByTestId("CheckCircleIcon")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("muestra el estado de error (3)", () => {
    render(<StatusBadge status={3} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByTestId("ErrorIcon")).toBeInTheDocument();
  });
});
