/**
 * Public DTOs for phase 4. Storage aliases are intentionally absent.
 * Datasource/widget type enum values change with the phase 5 data migration.
 * @typedef {Object} Entity
 * @property {number|string} entity_id
 * @property {number|string} client_id
 * @property {string} name
 * @property {'mqtt'|'api'} datasource_type
 * @property {{sub_topic?: string, pub_topic?: string, heartbeat_timeout_s?: number, base_url?: string, method?: string, polling_interval_ms?: number, data_key?: string, query_params?: Object, headers?: Object, request_body?: Object}} datasource_config
 * @property {'online'|'offline'} [connection_status] Present when connectivity is tracked.
 * @property {{token: string}} [credential]
 * @property {number|string} [rulechain_id]
 *
 * @typedef {Object} Widget
 * @property {number|string} widget_id
 * @property {number|string} client_id
 * @property {number|string} entity_id
 * @property {number|string} dashboard_id
 * @property {string} name
 * @property {string} widget_type
 * @property {{data_key?: string, is_on?: boolean, message_on?: string, message_off?: string, html_template?: string, css?: string, line_color?: string, lat?: number|string, lon?: number|string}} widget_config
 *
 * @typedef {Object} Alarm
 * @property {number|string} alarm_id
 * @property {number|string} client_id
 * @property {number|string} entity_id
 * @property {number} threshold
 * @property {string} data_key
 * @property {'greater_than'|'less_than'} operator
 *
 * @typedef {Object} Notification
 * @property {number|string} notification_id
 * @property {number|string} client_id
 * @property {number|string} alarm_id
 * @property {boolean} is_read
 * @property {string} created_at ISO 8601 UTC.
 * @property {*} value
 *
 * @typedef {Object} Historic
 * @property {number|string} historic_id
 * @property {number|string} client_id
 * @property {number|string} entity_id
 * @property {string} recorded_at ISO 8601 UTC.
 * @property {string|null} data_key
 * @property {*} data JSON telemetry payload.
 *
 * @typedef {Object} Dashboard
 * @property {number|string} dashboard_id
 * @property {number|string} client_id
 * @property {string} name
 * @property {string} description
 * @property {Array<number|string>} shared_client_ids
 *
 * @typedef {Object} Client
 * @property {number|string} client_id
 * @property {string} name
 * @property {string} email
 * @property {'admin'|'client'|'manager'} role
 * @property {number|string|null} [admin_client_id]
 *
 * @typedef {Object} Rulechain
 * @property {number|string} rulechain_id
 * @property {string} name
 * @property {string|null} description
 * @property {number|string} client_id
 * @property {Array<number|string>} entity_ids
 * @property {{nodes: Array<{node_id: string, node_type: string, position: {x: number, y: number}, node_config: Object}>, edges: Array<{edge_id: string, source_node_id: string, target_node_id: string}>}} definition
 */
export {};
