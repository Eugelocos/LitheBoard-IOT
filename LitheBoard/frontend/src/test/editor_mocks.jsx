import React from "react";

// Dobles ligeros de los editores de terceros usados en los formularios de
// widgets: CodeMirror y el selector de color no funcionan bien en jsdom.

export function MockCodeMirror({ id, value, onChange }) {
  return <textarea aria-label={id} value={value} onChange={(e) => onChange(e.target.value)} />;
}

export function MockHexColorPicker({ id, onChange }) {
  return (
    <button type="button" onClick={() => onChange("#123456")}>
      pick-{id}
    </button>
  );
}
