async function generateRulesEngineJson(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    throw new Error("No hay nodos en el rulechain.");
  }

  // Validación: el primer nodo debe ser de tipo "input"
  const inputNode = nodes.find((n) => n.type === "input");
  if (!inputNode) {
    throw new Error(
      "La rulechain debe comenzar siempre con un nodo de entrada (input)."
    );
  }

  // Crear un mapa (id -> nodo) para acceso rápido.
  const nodeMap = new Map();
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
  });

  // Construir una lista de adyacencia (mapa: source id -> [target id])
  const adjacency = {};
  edges.forEach((edge) => {
    if (!adjacency[edge.source]) {
      adjacency[edge.source] = [];
    }
    adjacency[edge.source].push(edge.target);
  });

  let rules = [];
  let ruleIdCounter = 1;

  /**
   * DFS para recorrer cada rama del rulechain.
   * @param {string} currentNodeId - Id del nodo actual.
   * @param {Object} currentRule - Objeto acumulado con condiciones y acciones.
   */
  function dfs(currentNodeId, currentRule) {
    const node = nodeMap.get(currentNodeId);
    if (!node) return;

    // Procesar el nodo según su label y type:
    if (node.data.label === "Filtro de Mensajes") {
      if (node.data?.config?.filter) {
        currentRule.conditions.all.push({
          fact: currentRule.selected_key, // Consistencia en el nombre
          operator: node.data?.config?.filter,
          value: node.data?.config?.value,
        });
        console.log("Agregada condición de filtro:", node.data?.config?.filter);
      }
    } else if (node.data.label === "Retraso") {
      currentRule.actions.push({
        type: "delay",
        delay: node.data?.config?.delay || 0,
      });
      console.log("Agregada acción de retraso");
    } else if (node.data.label === "Agregador") {
      currentRule.actions.push({
        type: "aggregate",
        increment: node.data?.config?.agregator || "",
      });
      console.log("Agregada acción de agregador");
    } else if (node.data.label === "Notificación") {
      currentRule.actions.push({
        type: "alert",
        message: node.data?.config?.tipo
          ? `Notificación (${node.data.config.tipo})`
          : "Notificación",
        target: node.data?.config?.destino || "admin@example.com",
      });
      console.log("Agregada acción de notificación");
    } else if (node.data.label === "Almacenamiento") {
      currentRule.actions.push({
        type: "store",
        destination: node.data?.config?.destination || "database",
      });
      console.log("Agregada acción de almacenamiento");
    } else if (node.data.label === "Publicar MQTT") {
      currentRule.actions.push({
        type: "mqtt",
        topic: node.data?.config?.topic || "",
        message: node.data?.config?.message || "",
        qos: node.data?.config?.qos || ""
      });
      console.log("Agregada acción de MQTT");
    } else if (node.data.label === "Webhook") {
      currentRule.actions.push({
        type: "webhook",
        url: node.data?.config?.url || "",
      });
      console.log("Agregada acción de webhook");
    } else if (node.data.label === "Key Selector") {
      if (node.data?.config?.key) {
        console.log("Actualizando selected_key:", node.data.config.key);
        currentRule.selected_key = node.data.config.key;
      }
    }

    console.log(
      "Regla actual después de procesar:",
      JSON.stringify(currentRule)
    );

    // Obtener los hijos del nodo actual
    const children = adjacency[currentNodeId] || [];
    if (children.length === 0) {
      // Rama terminal: guardar la regla si tiene condiciones o acciones.
      if (
        currentRule.conditions.all.length > 0 ||
        currentRule.actions.length > 0
      ) {
        rules.push({ ...currentRule, rule_id: "rule-" + ruleIdCounter++ });
      }
    } else {
      // Para cada hijo, clonamos la regla (copia profunda) y continuamos el DFS.
      children.forEach((childId) => {
        const newRule = JSON.parse(JSON.stringify(currentRule));
        dfs(childId, newRule);
      });
    }
  }

  // Regla base: partimos del input
  const initialRule = {
    selected_key: "default_key", // Valor por defecto
    conditions: { all: [] },
    actions: [],
  };

  // Iniciamos el DFS desde el nodo de entrada.
  dfs(inputNode.id, initialRule);

  return {
    selected_key: initialRule.selected_key,
    rules,
  };
}
module.exports = {
  generateRulesEngineJson
}