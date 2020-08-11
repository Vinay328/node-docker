const express = require('express');
const fs = require('fs');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// Constants
const PORT = 8080;

// App
const app = express();
const EXPRESS_LOG_FILE = process.env.EXPRESS_LOG_FILE || './access.log';

const accessLogStream = fs.createWriteStream(`${EXPRESS_LOG_FILE}`, { flags: 'a' });

app.use(logger('combined', { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(compression());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/', (req,res) => {
    console.log("POST REQEUST CALLED");
    try {
        console.log(JSON.stringify(req.body));
        console.log(JSON.stringify(req));

    } catch (e) {
        console.log(e);
    }
    res.status(201).json(req.body);
});

app.post('/validate', (req,res) => {
    console.log("VALIDATE REQUEST CALLED");
    try {
        console.log(JSON.stringify(req.body));
        console.log(JSON.stringify(req));

    } catch (e) {
        console.log(e);
    }
    res.status(201).json(req.body);
});

app.listen(PORT);
console.log(`Running on port ${PORT}`);
