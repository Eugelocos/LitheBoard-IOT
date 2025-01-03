const mysql = require('mysql2');

function initialize(entity, eventEmitter) {
    const connection = mysql.createConnection(entity.datasource_config.config.dbConfig);
    const interval = entity.datasource_config.config.pollingInterval || 10000;

    const pollDatabase = async () => {
        connection.query(entity.datasource_config.config.query, (error, results) => {
            if (error) {
                console.error(`DB Error for entity ${entity.entity_id}:`, error.message);
                return;
            }
            eventEmitter.emit('datasourceEvent', { entity, data: results, source: 'db' });
        });
    };

    setInterval(pollDatabase, interval);
}

module.exports = { initialize };
