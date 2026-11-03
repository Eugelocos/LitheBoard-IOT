import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingIndicator from "./loading_indicator";

describe("<LoadingIndicator />", () => {
  it("muestra la marca mientras se carga la aplicación", () => {
    render(<LoadingIndicator />);

    expect(screen.getByRole("heading", { name: "Litheboard" })).toBeInTheDocument();
  });
});
