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

const swaggerDocument = require('../openapi.json');
app.use(
	'/docs',
	swaggerUi.serve,
	swaggerUi.setup(swaggerDocument, options = {
		customCss: '.swagger-ui .topbar { display: none; }'
	})
);

app.get(/^\/((health)|(ping))$/, (req, res) => res.send('PTL!'));

app.get('*', (req, res) =>
	res.redirect(`http://${HOST}:${PORT}/docs`)
);
