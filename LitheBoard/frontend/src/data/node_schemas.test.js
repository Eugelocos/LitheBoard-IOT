import { NODE_TYPES } from "./node_schemas";

const VALID_TYPES = ["input", "processing", "action", "logic", "output"];
const VALID_FIELD_TYPES = ["text", "number", "select"];
const VALID_HANDLES = ["left", "right", "top", "bottom"];

// Qué conexiones tiene cada tipo de nodo: las entradas solo emiten y las
// acciones/salidas solo reciben.
const EXPECTED_CONNECTIONS = {
  input: { has_inputs: false, has_outputs: true },
  processing: { has_inputs: true, has_outputs: true },
  logic: { has_inputs: true, has_outputs: true },
  action: { has_inputs: true, has_outputs: false },
  output: { has_inputs: true, has_outputs: false },
};

// Contrato que consumen la paleta y los nodos del editor de rulechains.
describe("NODE_TYPES", () => {
  it("tiene etiquetas únicas", () => {
    const labels = NODE_TYPES.map((node) => node.label);

    expect(new Set(labels).size).toBe(labels.length);
  });

  it("incluye al menos un nodo de cada tipo", () => {
    const types = new Set(NODE_TYPES.map((node) => node.type));

    expect([...types].sort()).toEqual([...VALID_TYPES].sort());
  });

  describe.each(NODE_TYPES.map((node) => [node.label, node]))("%s", (_label, node) => {
    it("define la información visual básica", () => {
      expect(VALID_TYPES).toContain(node.type);
      expect(node.icon).toEqual(expect.any(String));
      expect(node.color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("declara conexiones coherentes con su tipo", () => {
      const { inputs = [], outputs = [] } = node.handles;

      [...inputs, ...outputs].forEach((handle) => expect(VALID_HANDLES).toContain(handle));
      expect({ has_inputs: inputs.length > 0, has_outputs: outputs.length > 0 }).toEqual(
        EXPECTED_CONNECTIONS[node.type],
      );
    });

    it("define campos válidos", () => {
      const fields = node.fields || [];
      const names = fields.map((field) => field.name);

      expect(new Set(names).size).toBe(names.length);
      fields.forEach((field) => {
        expect(field.name).toEqual(expect.any(String));
        expect(field.label).toEqual(expect.any(String));
        expect(VALID_FIELD_TYPES).toContain(field.type);
      });
    });
  });

  const select_fields = NODE_TYPES.flatMap((node) =>
    (node.fields || []).filter((field) => field.type === "select").map((field) => [node.label, field.name, field]),
  );

  it.each(select_fields)("el select %s › %s tiene opciones", (_label, _name, field) => {
    expect(field.options.length).toBeGreaterThan(0);
  });
});
