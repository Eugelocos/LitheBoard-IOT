const DatasourceController = require('./datasource_controller');
const entityModel = require('../models/entity_model');

let datasource_controller = null;

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initDatasourceController = async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const entities = await entityModel.getEntities();
            datasource_controller = new DatasourceController(entities);
            datasource_controller.initialize();
            console.log('DatasourceController initialized successfully.');
            return datasource_controller;
        } catch (error) {
            console.error(
                `Intento ${attempt}/${MAX_RETRIES} fallido al inicializar DatasourceController (${error.message}).`
            );
            if (attempt === MAX_RETRIES) {
                console.error('Se agotaron los reintentos. El backend sigue arriba, pero sin datasources inicializados.');
                throw error;
            }
            await sleep(RETRY_DELAY_MS);
        }
    }
};


let datasourceReadyPromise = initDatasourceController().catch((error) => {
    console.error('DatasourceController no se pudo inicializar tras reintentar:', error.message);
    return null;
});


const getDatasourceController = async () => {
    if (!datasourceReadyPromise) {
        throw new Error('DatasourceController initialization failed.');
    }
    return await datasourceReadyPromise;
};

module.exports = { getDatasourceController };