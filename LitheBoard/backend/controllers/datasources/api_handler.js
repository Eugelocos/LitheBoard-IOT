const axios = require('axios');
const running = new Map();
const entityKey = (entity) => `${entity.client_id}:${entity.entity_id}`;

function stop(entity) {
    const state = running.get(entityKey(entity));
    if (!state) return;
    state.stopped = true;
    clearTimeout(state.timer);
    state.abort.abort();
    running.delete(entityKey(entity));
}

//missing doc
function initialize(entity, eventEmitter) {
    stop(entity);
    const state = { stopped: false, timer: null, abort: new AbortController() };
    running.set(entityKey(entity), state);
    const interval = entity.datasource_config.polling_interval_ms || 600000;

    const fetchData = async () => {
        try {
            const {
                base_url,
                method,
                query_params,
                headers,
                request_body,
            } = entity.datasource_config;

            // Construir la URL con los query parameters si existen
            const url = new URL(base_url);
            if (query_params) {
                const params = new URLSearchParams(query_params);
                url.search = params.toString();
            }

            // Configurar opciones para la solicitud
            // FIX: `headers` viene de una columna JSON de MySQL, así que
            // mysql2 ya la entrega como objeto (no como string). Hacerle
            // JSON.parse a un objeto tira SyntaxError y rompía el polling
            // en silencio para cualquier entidad con headers configurados
            // (mismo bug ya encontrado y corregido en widget_service.js /
            // dashboard_service.js / entity_service.js).
            const options = {
                signal: state.abort.signal,
                timeout: 30000,
                method: method || 'GET',
                url: url.toString(),
                headers: typeof headers === 'string'
                    ? JSON.parse(headers)
                    : headers || {},
            };

            // Agregar el body solo si el método no es GET o DELETE
            if (['POST', 'PUT', 'PATCH'].includes(method?.toUpperCase())) {
                options.data = typeof request_body === 'string'
                    ? JSON.parse(request_body)
                    : request_body || {};
            }

            // Realizar la solicitud
            const response = await axios(options);

            // Emitir los datos al eventEmitter
            if (!state.stopped) eventEmitter.emit('datasourceEvent', {
                entity,
                data: response.data,
                source: 'api',
            });
        } catch (error) {
            if (state.stopped) return;
            console.error(
                `REST API Error for entity ${entity.entity_id}:`,
                error.message
            );
        } finally {
            if (!state.stopped) state.timer = setTimeout(fetchData, interval);
        }
    };

    fetchData();
}



module.exports = { initialize, stop };
