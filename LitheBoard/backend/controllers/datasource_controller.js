const EventEmitter = require('events');
const mqtt_handler = require('./datasources/mqtt_handler');
const db_handler = require('./datasources/db_handler');
const restApiHandler = require('./datasources/api_handler');
const historialModel = require('../models/historial_model');
const alarmModel = require('../models/alarm_model');

class DatasourceController extends EventEmitter {
    constructor(entities) {
        super();
        this.entities = entities; // Lista de entidades.
        this.entityMap = new Map(); // Mapa de entidades por ID para referencia rápida.

        entities.forEach(entity => {
            this.entityMap.set(entity.entity_id, entity);
        });
    }

    initialize() {
        this.entities.forEach(entity => {
            const { datasource_type, entity_id } = entity;

            this.entityMap.set(entity_id, entity); // Mapeo para acceso rápido.

            switch (datasource_type) {
                case 'MQTT':
                    mqtt_handler.initialize(entity, this);
                    break;
                case 'DB':
                    db_handler.initialize(entity, this);
                    break;
                case 'API':
                    restApiHandler.initialize(entity, this);
                    break;
                default:
                    console.error(`Unknown datasource type: ${datasource_type}`);
            }
        });

        // Escuchar eventos generados por los handlers
        this.on('datasourceEvent', this.handleDatasourceEvent.bind(this));
    }

    async handleDatasourceEvent({ entity, data, source }) {
        try {
            console.log(`Event from ${source} for entity ${entity.entity_id}:`);

            // Guardar el historial
            await historialModel.saveMessage(entity.entity_id, entity.client_id, null, data);

            // Procesar alarmas
            const alarms = await alarmModel.getAlarmsByDevice(entity.entity_id, entity.client_id);
            if (alarms && alarms.length > 0) {
                for (const alarm of alarms) {
                    const conditionMet = this.checkAlarmCondition(alarm, data);
                    if (conditionMet) {
                        await alarmModel.saveAlarmNotification(
                            alarm[0].alarm_id,
                            entity.client_id,
                            parseInt(data[alarm[0].selected_key])
                        );
                        console.log(`Alarm notification registered for ${entity.entity_id}`);
                    }
                }
            }else{
                console.log("No alarms found")
            }
        } catch (error) {
            console.error(`Error handling event for entity ${entity.entity_id}:`, error);
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
            this.entities = this.entities.filter(e => e.entity_id !== entity_id);
        }
    }

    setupEntity(entity) {
        const { datasource_type, entity_id } = entity;
    
        this.entityMap.set(entity_id, entity);
        
        switch (datasource_type) {
            case 'MQTT':
                mqtt_handler.initialize(entity, this);
                console.log(`MQTT handler initialized for entity ${entity_id}`);
                break;
            case 'DB':
                db_handler.initialize(entity, this);
                console.log(`DB handler initialized for entity ${entity_id}`);
                break;
            case 'API':
                restApiHandler.initialize(entity, this);
                console.log(`API handler initialized for entity ${entity_id}`);
                break;
            default:
                console.error(`Unknown datasource type: ${datasource_type}`);
        }
    }
}

module.exports = DatasourceController;
