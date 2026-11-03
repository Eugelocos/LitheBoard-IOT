const mysql = require('mysql2/promise'); // Usamos la versión prometida

const running = new Map();
const entityKey = (entity) => `${entity.client_id}:${entity.entity_id}`;
async function stop(entity) {
    const state = running.get(entityKey(entity));
    if (!state) return;
    state.stopped = true;
    clearTimeout(state.timer);
    running.delete(entityKey(entity));
    if (state.connection) await state.connection.end();
}
async function initialize(entity, eventEmitter) {
    const previousStop = stop(entity);
    const state = { stopped: false, timer: null, connection: null };
    running.set(entityKey(entity), state);
    try {
        await previousStop;
        if (state.stopped) return;
        // Crear la conexión usando la versión prometida de mysql2
        const connection = await mysql.createConnection(entity.datasource_config.dbConfig);
        state.connection = connection;
        if (state.stopped) { await connection.end(); return; }
        const interval = entity.datasource_config.pollingInterval || 10000;

        const pollDatabase = async () => {
            try {
                // Verificar que la consulta es válida
                if (!entity.datasource_config.query) {
                    throw new Error('No se encontró una consulta en entity.datasource_config.query');
                }

                // Ejecutar la consulta utilizando la interfaz prometida
                const [results] = await connection.query(entity.datasource_config.query);
                if (!state.stopped) eventEmitter.emit('datasourceEvent', { entity, data: results, source: 'db' });
            } catch (error) {
                console.error(`DB Error for entity ${entity.entity_id}:`, error.message);
            } finally {
                if (!state.stopped) state.timer = setTimeout(pollDatabase, interval);
            }
        };

        pollDatabase();
    } catch (error) {
        console.error('Error initializing DatasourceController:', error.message);
    }
}

module.exports = { initialize, stop };
