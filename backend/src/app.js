const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors);
app.use(bodyParser.json());

app.use(routes);

app.use(errorHandler);

module.exports = app;
