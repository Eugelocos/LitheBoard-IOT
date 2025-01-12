const mysql = require('mysql2/promise'); // Usamos la versión prometida

async function initialize(entity, eventEmitter) {
    try {
        // Crear la conexión usando la versión prometida de mysql2
        const connection = await mysql.createConnection(entity.datasource_config.dbConfig);
        const interval = entity.datasource_config.pollingInterval || 10000;

        const pollDatabase = async () => {
            try {
                // Verificar que la consulta es válida
                if (!entity.datasource_config.query) {
                    throw new Error('No se encontró una consulta en entity.datasource_config.query');
                }

                // Ejecutar la consulta utilizando la interfaz prometida
                const [results] = await connection.query(entity.datasource_config.query);
                eventEmitter.emit('datasourceEvent', { entity, data: results, source: 'DB' });
            } catch (error) {
                console.error(`DB Error for entity ${entity.entity_id}:`, error.message);
            } finally {
                setTimeout(pollDatabase, interval);
            }
        };

        pollDatabase();
    } catch (error) {
        console.error('Error initializing DatasourceController:', error.message);
    }
}

module.exports = { initialize };
