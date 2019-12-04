const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');

const app = new express();

app.disable('x-powered-by');
app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

require('dotenv').config();

const { HOST, PORT } = process.env;
const { name } = require('../package.json');

app.listen(PORT, () => {
	console.log(`${name} running on http://${HOST}:${PORT}`);
});

const users = require('./routes/users');
app.use('/users', users);

const auth = require('./routes/auth');
app.use('/auth', auth);

app.use(/^\/((health)|(ping))$/, (req, res) => res.send('PTL!'));

const contract = require('../openapi.json');
const options = {
	customSiteTitle: "Twitter as a Database",
	customfavIcon: "../assets/favicon.ico",
	customCss: '.swagger-ui .topbar { display: none; }',
};

app.use('/assets', express.static('assets'));
app.use('/', swaggerUi.serve, swaggerUi.setup(contract, options));
