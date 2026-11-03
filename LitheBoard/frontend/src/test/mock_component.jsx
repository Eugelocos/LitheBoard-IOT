import React from "react";

/**
 * Últimas props recibidas por cada componente simulado, indexadas por nombre.
 * Permite a los tests de componentes "contenedores" invocar los callbacks que
 * pasan a sus hijos sin depender de la implementación de esos hijos.
 */
export const mockProps = {};

/**
 * Crea un componente falso que registra sus props y renderiza un marcador.
 * Uso: jest.mock("./hijo", () => require("../test/mock_component").mockComponent("Hijo"));
 */
export function mockComponent(name) {
  function MockComponent(props) {
    mockProps[name] = props;
    return <div data-testid={name}>{props.children}</div>;
  }
  return { __esModule: true, default: MockComponent };
}

export function resetMockProps() {
  Object.keys(mockProps).forEach((key) => delete mockProps[key]);
}
