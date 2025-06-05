import React, { useState, useEffect } from "react";
import { Handle } from "@xyflow/react";
import { TextField, MenuItem, Typography, Box } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";

export default function OutputNode({ id, data }) {
  const { onConfigChange } = data;
  const fields = data.fields || [];

  // Inicializa valores igual que en ProccessingNode
  const initializeValues = () => {
    const initialValues = {};
    fields.forEach((field) => {
      if (field.type === "select") {
        initialValues[field.name] =
          data.config?.[field.name] ?? field.options?.[0] ?? "";
      } else {
        initialValues[field.name] = data.config?.[field.name] ?? "";
      }
    });
    return initialValues;
  };

  const [fieldsValues, setFieldsValues] = useState(initializeValues());

  // Si data.config cambia externamente, resetea
  useEffect(() => {
    setFieldsValues(initializeValues());
  }, [data.config]);

  // Mismo handleChange que en ProccessingNode
  const handleChange = (fieldName) => (event) => {
    const newValue = event.target.value;
    const updatedValues = { ...fieldsValues, [fieldName]: newValue };
    setFieldsValues(updatedValues);
    if (onConfigChange) {
      onConfigChange(id, updatedValues);
    }
  };

  return (
    <div style={{ borderRadius: 4, backgroundColor: data.color, padding: 8 }}>
      <div style={{ textAlign: "center" }}>{data.label}</div>

      {fields.map((field) => {
        if (field.type === "text") {
          return (
            <TextField
              key={field.name}
              label={field.label}
              value={fieldsValues[field.name]}
              onChange={handleChange(field.name)}
              fullWidth
              margin="dense"
              variant="filled"
            />
          );
        }

        if (field.type === "select" && Array.isArray(field.options)) {
          return (
            <Box
              key={field.name}
              sx={{
                mt: 2,
                position: "relative",
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              <Typography
                variant="subtitle2"
                component="label"
                sx={{ mb: 0.5, display: "block", color: "#000000de" }}
              >
                {field.label}
              </Typography>

              <select
                value={fieldsValues[field.name]}
                onChange={handleChange(field.name)}
                style={{
                  width: "100%",
                  minHeight: "1.4375em",
                  padding: "16px 40px 16px 12px",
                  fontSize: "1rem",
                  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                  color: "rgba(0, 0, 0, 0.87)",
                  backgroundColor: "#0000000f",
                  border: "none",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
                  borderRadius: "4px 4px 0 0",
                  outline: "none",
                  appearance: "none",
                  transition: "background-color 200ms ease, border-bottom-color 200ms ease",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = "#fff";
                  e.target.style.borderBottom = "2px solid #1976d2";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "#f5f5f5";
                  e.target.style.borderBottom = "1px solid rgba(0, 0, 0, 0.42)";
                }}
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <KeyboardArrowDown
                sx={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(0,0,0,0.54)",
                  pointerEvents: "none",
                }}
              />
            </Box>
          );
        }

        return null;
      })}

      {/* Manera idéntica de renderear handles */}
      {data.handles?.inputs?.map((pos, i) => (
        <Handle
          key={`input-${i}`}
          type="target"
          position={pos}
          style={{ background: "#555", width: 10, height: 10, top: 20 * (i + 1) }}
        />
      ))}
      {data.handles?.outputs?.map((pos, i) => (
        <Handle
          key={`output-${i}`}
          type="source"
          position={pos}
          style={{ background: "#555", width: 10, height: 10, top: 20 * (i + 1) }}
        />
      ))}
    </div>
  );
}
