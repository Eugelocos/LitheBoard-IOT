import React from "react";

function WidgetCustomValueCard({value, html, css}) {
  
  const injectedHtml = html ? html.replace(/\${value}/g, value) : "Error: HTML no definido";


  return (
    <>
      <iframe
        sandbox="allow-scripts"
        style={{
          width: "100%",
          height: "100%", // Ajusta la altura según sea necesario
          border: "none",
        }}
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                /* Estilos heredados del parent document */
                body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  margin: 0;
                  height: 100%;
                }
                /* Agregar el CSS del parent document */
                ${css}
              </style>
            </head>
            <body>
  
              ${injectedHtml}
            </body>
          </html>
        `}
        title="Custom Widget"
      />

      
    </>
  );
};

export default WidgetCustomValueCard;
