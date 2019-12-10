const express = require('express');
const morgan = require('morgan');
const favicon = require('serve-favicon');

const app = new express();

app.disable('x-powered-by');
app.disable('etag');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(favicon('./public/favicon.ico'));
app.use('/public', express.static('public'));

const check = new RegExp(/^\/((health)|(ping))$/);
app.use(check, (req, res) => res.send('PTL!'));

const users = require('./routes/users');
app.use('/users', users);

const auth = require('./routes/auth');
app.use('/auth', auth);

const openapi = require('./routes/openapi');
app.use(openapi);

module.exports = app;
