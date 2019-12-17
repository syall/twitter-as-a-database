const express = require('express');
const swaggerUi = require('swagger-ui-express');
const router = express.Router();

const contract = require('../config/openapi.json');

const { HOST, SSL_ENABLED } = process.env;
const ssl = SSL_ENABLED == 'true' ? 's' : '';
contract.servers = [
	{
		url: `http${ssl}://localhost:3000`,
		description: 'development',
	},
	{
		url: `https://${HOST}`,
		description: 'heroku',
	}
];

const options = {
	customSiteTitle: 'Twitter as a Database',
	customfavIcon: '/public/favicon.ico',
	customCss: '.swagger-ui .topbar { display: none; }',
};

router.use(
	swaggerUi.serve,
	swaggerUi.setup(contract, options)
);

module.exports = router;
