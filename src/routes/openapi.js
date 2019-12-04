const express = require('express');
const swaggerUi = require('swagger-ui-express');
const router = express.Router();

const contract = require('../../openapi.json');

const options = {
	customSiteTitle: 'Twitter as a Database',
	customCss: '.swagger-ui .topbar { display: none; }',
};

router.use(
	swaggerUi.serve,
	swaggerUi.setup(contract, options)
);

module.exports = router;
