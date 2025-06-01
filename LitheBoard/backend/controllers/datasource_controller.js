const EventEmitter = require("events");
const mqtt_handler = require("./datasources/mqtt_handler");
const db_handler = require("./datasources/db_handler");
const restApiHandler = require("./datasources/api_handler");
const historialModel = require("../models/historial_model");
const alarmModel = require("../models/alarm_model");
const ruleEngine = require('./rulechain_engine');
const rulechainModel = require('../models/rulechain_model')
const eventBus = require('./../services/event_bus');
const wsHelper = require('../sockets/ws_helper')

class DatasourceController extends EventEmitter {
  constructor(entities) {
    super();
    this.entities = entities; // Lista de entidades.
    this.entityMap = new Map(); // Mapa de entidades por ID para referencia rápida.

    entities.forEach((entity) => {
      this.entityMap.set(entity.entity_id, entity);
    });
  }

  initialize() {
    this.entities.forEach((entity) => {
      const { datasource_type, entity_id } = entity;
      console.log("With Entity :", entity.entity_id)
      this.entityMap.set(entity_id, entity); // Mapeo para acceso rápido.

      switch (datasource_type) {
        case "MQTT":
          mqtt_handler.initialize(entity, this);
          break;
        case "DB":
          db_handler.initialize(entity, this);
          break;
        case "API":
          restApiHandler.initialize(entity, this);
          break;
        default:
          console.error(`Unknown datasource type: ${datasource_type}`);
      }
    });

    // Escuchar eventos generados por los handlers
    this.on("datasourceEvent", this.handleDatasourceEvent.bind(this));
    
    eventBus.on('entity.updated', this.onEntityUpdated.bind(this));
  }

  async handleDatasourceEvent({ entity, data, source }) {
    try {


      console.log("-------<>---------")
      const rulechain = await rulechainModel.getRulechainById(entity.rulechain_id);
      const rulechainCompiled = typeof rulechain.compiled === 'string'
      ? JSON.parse(rulechain.compiled)
      : rulechain.compiled;
      if (
        rulechainCompiled &&
        rulechainCompiled.selected_key &&
        rulechainCompiled.rules
      ) {
        ruleEngine.processDynamicRuleChain(rulechainCompiled, entity, data)
        .then(() => console.log("Procesamiento secuencial completado."))
        .catch((err) => console.error("Error en el procesamiento secuencial:", err));
      } else {
        console.log(
          `No hay configuración de rulechain para la entidad ${entity.entity_id}`
        );
      }

      wsHelper.emitDataMessage({
        entity_id: entity.entity_id
      });

      const alarms = await alarmModel.getAlarmsByDevice(
        entity.entity_id,
        entity.client_id
      );
      if (alarms && alarms.length > 0) {
        for (const alarm of alarms) {
          const conditionMet = this.checkAlarmCondition(alarm, data);
          if (conditionMet) {
            await alarmModel.saveAlarmNotification(
              alarm[0].alarm_id,
              entity.client_id,
              parseInt(data[alarm[0].selected_key])
            );
            console.log(
              `Alarm notification registered for ${entity.entity_id}`
            );
          }
        }
      } else {
        console.log("No alarms found");
      }


    } catch (error) {
      console.error(
        `Error handling event for entity ${entity.entity_id}:`,
        error
      );
    }
  }

  checkAlarmCondition(alarm, messageData) {
    try {
      const value = parseFloat(messageData[alarm[0].selected_key]);
      const threshold = parseFloat(alarm[0].valor);

      if (isNaN(value) || isNaN(threshold)) {
        console.error("Invalid value or threshold.");
        return false;
      }

      if (alarm[0].alarm_condition === ">" && value > threshold) {
        console.log("Alarm condition met: Greater than threshold.");
        return true;
      } else if (alarm[0].alarm_condition === "<" && value < threshold) {
        console.log("Alarm condition met: Less than threshold.");
        return true;
      }

      console.log("No alarm condition met.");
      return false;
    } catch (error) {
      console.error("Error checking alarm condition:", error);
      return false;
    }
  }

  async onEntityUpdated(entity) {
    console.log(`Entity updated event: ${entity.entity_id}`);
    await this.addOrUpdateEntity(entity);
  }

  async addOrUpdateEntity(entity) {
    if (this.entityMap.has(entity.entity_id)) {
      console.log(`Updating entity: ${entity.entity_id}`);
      this.removeEntity(entity.entity_id); // Limpiar configuración previa.
    } else {
      console.log(`Adding new entity: ${entity.entity_id}`);
    }

    this.setupEntity(entity);
  }

  removeEntity(entity_id) {
    const entity = this.entityMap.get(entity_id);
    if (entity) {
      // Aquí puedes añadir lógica para detener handlers si es necesario.
      this.entityMap.delete(entity_id);
      this.entities = this.entities.filter((e) => e.entity_id !== entity_id);
    }
  }

  setupEntity(entity) {
    const { datasource_type, entity_id } = entity;

    this.entityMap.set(entity_id, entity);

    switch (datasource_type) {
      case "MQTT":
        mqtt_handler.initialize(entity, this);
        console.log(`MQTT handler initialized for entity ${entity_id}`);
        break;
      case "DB":
        db_handler.initialize(entity, this);
        console.log(`DB handler initialized for entity ${entity_id}`);
        break;
      case "API":
        restApiHandler.initialize(entity, this);
        console.log(`API handler initialized for entity ${entity_id}`);
        break;
      default:
        console.error(`Unknown datasource type: ${datasource_type}`);
    }
  }
}

module.exports = DatasourceController;
