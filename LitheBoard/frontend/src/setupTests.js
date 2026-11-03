// jest-dom adds custom jest matchers for asserting on DOM nodes.
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// Los tests con DataGrid/Drawer de MUI son pesados en jsdom; 5 s (por defecto)
// se queda corto en entornos lentos como Docker sobre un volumen de Windows.
jest.setTimeout(20000);
// Lo mismo para findBy*/waitFor (1 s por defecto).
configure({ asyncUtilTimeout: 5000 });

// Los componentes registran mucho en consola (console.log/warn/error) como
// parte de su flujo normal. Se silencia para mantener la salida de los tests
// legible; cada test puede inspeccionar las llamadas con `console.error.mock`.
beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
  jest.restoreAllMocks();
});
