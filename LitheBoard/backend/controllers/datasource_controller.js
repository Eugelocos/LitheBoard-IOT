const EventEmitter = require("events");
const mqtt_handler = require("./datasources/mqtt_handler");
const db_handler = require("./datasources/db_handler");
const restApiHandler = require("./datasources/api_handler");
const alarmModel = require("../models/alarm_model");
const historicModel = require('../models/historic_model');
const ruleEngine = require('./rulechain_engine');
const rulechainModel = require('../models/rulechain_model')
const eventBus = require('./../services/event_bus');



// Hacer que el rulechain engine no sea un singleton

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
    this.on("datasourceEvent", this.handleDatasourceEvent.bind(this));
    this.entities.forEach((entity) => {
      const { datasource_type, entity_id } = entity;
      //console.log("With Entity :", entity.entity_id)
      this.entityMap.set(entity_id, entity); // Mapeo para acceso rápido.

      switch (datasource_type) {
        case "mqtt":
          mqtt_handler.initialize(entity, this);
          break;
        case "db":
          db_handler.initialize(entity, this);
          break;
        case "api":
          restApiHandler.initialize(entity, this);
          break;
        default:
          console.error(`Unknown datasource type: ${datasource_type}`);
      }
    });

    // Escuchar eventos generados por los handlers
    
    eventBus.on('entity.updated', this.onEntityUpdated.bind(this));
  }

  async handleDatasourceEvent({ entity, data, source }) {
    try {


      //console.log("-------<>---------")
      if (!Number(entity.rulechain_id)) {
        // The built-in default stores the complete payload. Custom chains own
        // persistence themselves, so a store action never runs twice.
        await historicModel.saveMessage(entity.entity_id, entity.client_id, null, data);
      } else {
        const rulechain = await rulechainModel.getRulechainById(entity.rulechain_id);
        const rulechainCompiled = typeof rulechain?.compiled === 'string'
        ? JSON.parse(rulechain.compiled)
        : rulechain?.compiled;
        if (
          rulechainCompiled &&
          Array.isArray(rulechainCompiled.rules)
        ) {
          await ruleEngine.processDynamicRuleChain(rulechainCompiled, entity, data);
        } else {
          console.log(
            `No hay configuración de rulechain para la entidad ${entity.entity_id}`
          );
        }
      }



      const alarms = await alarmModel.getAlarmsByDevice(
        entity.entity_id,
        entity.client_id
      );
      if (alarms && alarms.length > 0) {
        for (const alarm of alarms) {
          const conditionMet = this.checkAlarmCondition(alarm, data);
          if (conditionMet) {
            await alarmModel.saveAlarmNotification(
              alarm.alarm_id,
              entity.client_id,
              Number(data[alarm.data_key])
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
      const value = parseFloat(messageData[alarm.data_key]);
      const threshold = parseFloat(alarm.threshold);

      if (isNaN(value) || isNaN(threshold)) {
        console.error("Invalid value or threshold.");
        return false;
      }

      if (alarm.operator === "greater_than" && value > threshold) {
        console.log("Alarm condition met: Greater than threshold.");
        return true;
      } else if (alarm.operator === "less_than" && value < threshold) {
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
      await this.removeEntity(entity.entity_id);
    } else {
      console.log(`Adding new entity: ${entity.entity_id}`);
    }

    await this.setupEntity(entity);
  }

  async removeEntity(entity_id) {
    const key = [...this.entityMap.keys()].find((id) => String(id) === String(entity_id));
    const entity = this.entityMap.get(key);
    if (entity) {
      const handler = { mqtt: mqtt_handler, api: restApiHandler, db: db_handler }[entity.datasource_type];
      if (handler?.stop) await handler.stop(entity);
      this.entityMap.delete(key);
      this.entities = this.entities.filter((e) => String(e.entity_id) !== String(entity_id));
    }
  }

  async setupEntity(entity) {
    const { datasource_type, entity_id } = entity;

    this.entityMap.set(entity_id, entity);

    switch (datasource_type) {
      case "mqtt":
        mqtt_handler.initialize(entity, this);
        console.log(`MQTT handler initialized for entity ${entity_id}`);
        break;
      case "db":
        await db_handler.initialize(entity, this);
        console.log(`DB handler initialized for entity ${entity_id}`);
        break;
      case "api":
        restApiHandler.initialize(entity, this);
        console.log(`API handler initialized for entity ${entity_id}`);
        break;
      default:
        console.error(`Unknown datasource type: ${datasource_type}`);
    }
  }
}

module.exports = DatasourceController;
