// ruleEngine.js
const { Engine } = require('json-rules-engine');
const {publishMessage, publishToTopic} = require('./datasources/mqtt_handler')
const historialModel = require('../models/historial_model')
const {sendAlertEmail} = require('./mail_controller')
const axios = require('axios');

// Instancia única del engine.
const engine = new Engine();

/**
 * Función helper para esperar ms milisegundos.
 * @param {number} ms 
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Carga en el engine una única regla (la actual) removiendo las reglas previas.
 * Se asume que cada regla tiene sus condiciones definidas y al menos una acción.
 * Para simplificar, se carga la regla usando la primera acción como evento.
 * @param {Object} rule - La regla de la configuración del rulechain.
 */
function loadRule(rule) {
  // "Limpiamos" las reglas previas asignando un array vacío.
  engine.rules = [];
  engine.addRule({
    conditions: rule.conditions,
    event: {
      type: rule.actions[0].type, // Se usa la primera acción para disparar el evento.
      params: rule.actions[0]
    },
    priority: 1
  });
}



// Mapeo de los tipos de acción a sus respectivos handlers.
const actionHandlers = {
  alert: async (params, entity, facts) => {
    console.log(`ALERTA para ${entity.entity_id}: ${params.message}`);
    // TODO: integrar tu servicio de alertas (email, SMS, etc.)
  },

  notify: async (params, entity, facts) => {
    console.log(`NOTIFICACIÓN para ${entity.entity_id}: ${params.message}`);
    // TODO: integrar servicio de notificaciones push o in-app
  },

  store: async (params, entity, facts) => {
    console.log(`GUARDAR datos en ${params.destination} para ${entity.entity_id}:`, facts);
    // Guarda el mensaje en la base de datos de historial
    await historialModel.saveMessage(
      entity.entity_id,
      entity.client_id,
      params.destination || null,
      facts
    );
  },

  aggregate: async (params, entity, facts, currentKey) => {
    console.log(`AGREGAR acción: incrementar el valor en ${params.increment || 10}`);
    if (currentKey) {
      const inc = Number(params.increment) || 10;
      facts[currentKey] = (facts[currentKey] || 0) + inc;
      console.log(`Nuevo valor de ${currentKey} en facts: ${facts[currentKey]}`);
    } else {
      console.log("Aggregate sin currentKey: no se acumula.");
    }
  },

  mqtt: async ({ topic, message, qos}, entity, facts) => {
    // Construye el payload: usa el message explícito o los facts.
    const payload = message || JSON.stringify(facts);
    console.log(`PUBLICAR MQTT en ${topic} con qos ${qos} para ${entity.entity_id}:`, payload);
    await publishToTopic(entity, topic, payload, qos);
  },

  webhook: async (params, entity, facts) => {
    console.log(`WEBHOOK disparado para ${entity.entity_id}: ${params.url}`);
    try {
      await axios.post(params.url, {
        entity,
        data: facts,
        payload: params.payload || {}
      });
    } catch (err) {
      console.error(`Error al llamar webhook ${params.url}:`, err.message);
    }
  },

  delay: async (params) => {
    console.log(`Ejecutando retraso de ${params.delay} ms`);
    await sleep(Number(params.delay) || 0);
  }
};


/**
 * Procesa el rulechain de forma secuencial.
 * Se evalúan las reglas en orden y se actualizan los facts (por ejemplo, el valor de la key seleccionada)
 * según las acciones modificadoras.
 * - Si una regla de tipo "Filtro de Mensajes" no se dispara, se corta el procesamiento.
 * - Si se ejecuta una acción "aggregate", se suma el incremento al fact.
 * - Si se ejecuta una acción "delay", se espera el tiempo indicado.
 * 
 * @param {Object} ruleChainConfig - Configuración del rulechain (debe incluir selected_key y un array de rules).
 * @param {Object} entity - La entidad asociada al evento.
 * @param {Object} data - Los datos del evento.
 * @returns {Object} facts finales.
 */
// Función recursiva para procesar una rama del rulechain dinámico.
async function processDynamicBranch(rule, facts, currentKey, entity, data) {
  // 1) Selector de key
  if (rule.selected_key && rule.selected_key !== "default_key") {
    if (currentKey !== rule.selected_key) {
      currentKey = rule.selected_key;
      facts = { [currentKey]: parseFloat(data[currentKey]) || 0 };
      console.log(`Actualizando key a "${currentKey}" con valor inicial: ${facts[currentKey]}`);
    }
  } else {
    // Si NO hay selector, volvemos a full-data sólo si veníamos de key-mode
    if (currentKey !== null) {
      console.log(`Regla ${rule.rule_id} sin selector: reset full-data.`);
      currentKey = null;
      facts = { ...data };
    }
  }

  // 2) Ejecutar la regla
  loadRule(rule);
  const { events } = await engine.run(facts);
  if (!events.length) {
    console.log(`Condiciones de ${rule.rule_id} no cumplidas → se detiene rama.`);
    return { facts, currentKey };
  }

  // 3) Acciones
  for (const action of rule.actions) {
    const handler = actionHandlers[action.type];
    if (handler) {
      if (action.type === "aggregate") {
        await handler(action, entity, facts, currentKey);
      } else {
        await handler(action, entity, facts);
      }
    }
  }
  

  // 4) Hijos: **secuencial** dentro de la misma rama
  if (rule.children && rule.children.length) {
    for (const child of rule.children) {
      const result = await processDynamicBranch(child, facts, currentKey, entity, data);
      facts      = result.facts;
      currentKey = result.currentKey;
      console.log(`Resultado hijo ${child.rule_id}:`, facts);
    }
  }

  return { facts, currentKey };
}


async function processDynamicRuleChain(ruleChainConfig, entity, data) {
  // Inicializa context
  let currentKey = ruleChainConfig.selected_key || null;
  let facts      = currentKey
    ? { [currentKey]: parseFloat(data[currentKey]) || 0 }
    : { ...data };

  console.log("Facts iniciales:", facts);

  // Procesa cada regla raíz en orden secuencial
  for (const rule of ruleChainConfig.rules) {
    const result = await processDynamicBranch(rule, facts, currentKey, entity, data);
    facts      = result.facts;
    currentKey = result.currentKey;
    console.log(`Resultado rama ${rule.rule_id}:`, facts);
  }

  console.log("Facts finales:", facts);
  return facts;
}


module.exports = {
  processDynamicRuleChain,
  engine
};
