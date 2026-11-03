import widgetFieldsConfig from "./widget_forms_config";

const VALID_FIELD_TYPES = ["text", "number", "color", "script"];

describe("widgetFieldsConfig", () => {
  it("define formularios para todos los tipos de widget soportados", () => {
    expect(Object.keys(widgetFieldsConfig).sort()).toEqual(
      ["bar_chart", "custom_value_card", "line_chart", "map", "switch"].sort(),
    );
  });

  describe.each(Object.entries(widgetFieldsConfig))("%s", (_type, fields) => {
    it("incluye siempre nombre y clave del widget", () => {
      const ids = fields.map((field) => field.id);

      expect(ids).toEqual(expect.arrayContaining(["name", "data_key"]));
    });

    it("no repite identificadores de campo", () => {
      const ids = fields.map((field) => field.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    it("usa tipos de campo válidos con etiqueta", () => {
      fields.forEach((field) => {
        expect(VALID_FIELD_TYPES).toContain(field.type);
        expect(field.label).toEqual(expect.any(String));
      });
    });
  });

  const color_fields = Object.entries(widgetFieldsConfig).flatMap(([type, fields]) =>
    fields.filter((field) => field.type === "color").map((field) => [type, field.id, field]),
  );

  it.each(color_fields)("el color %s › %s tiene un threshold hexadecimal por defecto", (_type, _id, field) => {
    expect(field.value).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
