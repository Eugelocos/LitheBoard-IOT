export const NODE_TYPES = [
    // Inputs
    {
      label: "Input",
      type: "input",
      icon: "📤",
      color: "#2196F3",
      handles: { outputs: ["right"] },
    },

  
    // Processing
    {
      label: "Filtro de Mensajes",
      type: "processing",
      icon: "⚡",
      color: "#FFEB3B",
      fields: [
        { name: "value", label: "Threshold", type: "text" },
        {
          name: "filter",
          label: "Condition",
          type: "select",
          options: ["greaterThan", "lessThan", "equal"],
        },
      ],
      handles: { inputs: ["left"], outputs: ["right"] },
    },
    {
      label: "Key Selector",
      type: "processing",
      icon: "🔑",
      color: "#FFEB3B",
      fields: [{ name: "key", label: "Key", type: "text" }],
      handles: { inputs: ["left"], outputs: ["right"] },
    },
  
    // Actions
    {
      label: "Notificación",
      type: "action",
      icon: "🔔",
      color: "#4CAF50",
      fields: [
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          options: ["Email", "SMS"],
        },
        { name: "destino", label: "Destino", type: "text" },
      ],
      handles: { inputs: ["left"] },
    },
    {
      label: "Almacenamiento",
      type: "action",
      icon: "💾",
      color: "#4CAF50",
      fields: [],
      handles: { inputs: ["left"] },
    },
  
    // Logic
    {
      label: "Retraso",
      type: "logic",
      icon: "⏰",
      color: "#FF9800",
      fields: [{ name: "delay", label: "Delay (ms)", type: "number" }],
      handles: { inputs: ["left"], outputs: ["right"] },
    },
    {
      label: "Agregador",
      type: "logic",
      icon: "➕",
      color: "#FF9800",
      fields: [
        
         { name: "agregator", label: "Agregator", type: "text" }
        
      ],
      handles: { inputs: ["left"], outputs: ["right"] },
    },
  
    // Outputs
    {
      label: "Publicar MQTT",
      type: "output",
      icon: "📤",
      color: "#2196F3",
      fields: [
        { name: "topic", label: "Topic", type: "text" },
        { name: "qos", label: "QoS", type: "select", options: [0, 1, 2] },
      ],
      handles: { inputs: ["left"] },
    },
    {
      label: "Webhook",
      type: "output",
      icon: "🌐",
      color: "#2196F3",
      fields: [
        { name: "url", label: "URL", type: "text" },
        {
          name: "method",
          label: "Method",
          type: "select",
          options: ["GET", "POST", "PUT", "DELETE"],
        },
      ],
      handles: { inputs: ["left"] },
    },
  ];
  