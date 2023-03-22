const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());
morgan('dev');

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

module.exports = app;

const apiRouter = require('./api/api');
app.use('/api', apiRouter);
