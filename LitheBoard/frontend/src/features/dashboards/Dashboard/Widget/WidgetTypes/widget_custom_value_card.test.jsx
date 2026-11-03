import React from "react";
import { render, screen } from "@testing-library/react";
import WidgetCustomValueCard from "./widget_custom_value_card";

const getFrame = () => screen.getByTitle("Custom Widget");

describe("<WidgetCustomValueCard />", () => {
  it("sustituye todas las apariciones de ${value} en el HTML", () => {
    render(
      <WidgetCustomValueCard
        value={42}
        html={"<span>${value}</span><b>${value} °C</b>"}
        css=".x { color: red; }"
      />,
    );

    const srcDoc = getFrame().getAttribute("srcdoc");
    expect(srcDoc).toContain("<span>42</span><b>42 °C</b>");
    expect(srcDoc).not.toContain("${value}");
    expect(srcDoc).toContain(".x { color: red; }");
  });

  it("muestra un mensaje de error si no hay HTML definido", () => {
    render(<WidgetCustomValueCard value={1} />);

    expect(getFrame().getAttribute("srcdoc")).toContain("Error: HTML no definido");
  });

  it("aísla el contenido del usuario en un iframe sin acceso al mismo origen", () => {
    render(<WidgetCustomValueCard value={1} html="<p>${value}</p>" />);

    const sandbox = getFrame().getAttribute("sandbox");
    expect(sandbox).toBe("allow-scripts");
    expect(sandbox).not.toContain("allow-same-origin");
  });
});
