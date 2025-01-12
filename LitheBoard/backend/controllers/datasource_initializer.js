const DatasourceController = require('./datasource_controller');
const entityModel = require('../models/entity_model');

let datasource_controller = null;
let datasourceReadyPromise;

(async () => {
    datasourceReadyPromise = (async () => {
        try {
            const entities = await entityModel.getEntities();
            datasource_controller = new DatasourceController(entities);
            datasource_controller.initialize();
            console.log('DatasourceController initialized successfully.');
            return datasource_controller;
        } catch (error) {
            console.error('Failed to initialize DatasourceController:', error.message);
            throw error;
        }
    })();
})();


const getDatasourceController = async () => {
    if (!datasourceReadyPromise) {
        throw new Error('DatasourceController initialization failed.');
    }
    return await datasourceReadyPromise;
};

module.exports = { getDatasourceController };

