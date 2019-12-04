const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = new express();

app.disable('x-powered-by');
app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

const check = new RegExp(/^\/((health)|(ping))$/);
app.use(check, (req, res) => res.send('PTL!'));

const users = require('./routes/users');
app.use('/users', users);

const auth = require('./routes/auth');
app.use('/auth', auth);

const openapi = require('./routes/openapi');
app.use(openapi);

module.exports = app;
