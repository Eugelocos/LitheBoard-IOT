const axios = require('axios');

//missing doc
function initialize(entity, eventEmitter) {
    const interval = entity.datasource_config.polling_interval || 600000;

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
            const options = {
                method: method || 'GET',
                url: url.toString(),
                headers: headers ? JSON.parse(headers) : {}, // Parsear headers si están en formato JSON
            };

            // Agregar el body solo si el método no es GET o DELETE
            if (['POST', 'PUT', 'PATCH'].includes(method?.toUpperCase())) {
                options.data = request_body ? JSON.parse(request_body) : {};
            }

            // Realizar la solicitud
            const response = await axios(options);

            // Emitir los datos al eventEmitter
            eventEmitter.emit('datasourceEvent', {
                entity,
                data: response.data,
                source: 'API',
            });
        } catch (error) {
            /*console.error(
                `REST API Error for entity ${entity.entity_id}:`,
                error.message
            );*/
        }
    };

    fetchData();
    setInterval(fetchData, interval);
}



module.exports = { initialize };