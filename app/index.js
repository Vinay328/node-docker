const express = require('express');
const https = require('https');
const fs = require('fs');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const key = fs.readFileSync(__dirname + '/keys/my-private.key');
const cert = fs.readFileSync(__dirname + '/keys/my-certificate.crt');
const options = {
    passphrase: "vina",
    key: key,
    cert: cert
};

// Constants
const PORT = 8080;

// App
const app = express();
const EXPRESS_LOG_FILE = process.env.EXPRESS_LOG_FILE || './access.log';

const accessLogStream = fs.createWriteStream(`${EXPRESS_LOG_FILE}`, {flags: 'a'});

app.use(logger('combined', {stream: accessLogStream}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(compression());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/', (req, res) => {
    console.log("POST REQEUST CALLED");
    try {
        console.log(JSON.stringify(req.body));
        console.log(JSON.stringify(req));

    } catch (e) {
        console.log(e);
    }
    res.status(201).json(req.body);
});

function validate(body) {
    let errorObject = null;
    if (body.request.object.kind == "PodExecOptions") {
        errorObject = {
            "apiVersion": "admission.k8s.io/v1",
            "kind": "AdmissionReview",
            "response": {
                "uid": body.request.uid,
                "allowed": false,
                "status": {
                    "code": 403,
                    "message": "Forbidden - You are not allowed to run exec command"
                }
            }
        }

    } else if (body.request.operation == "CREATE" && body.request.object.kind == "Deployment" && body.request.object.spec.replicas < 2) {
        errorObject = {
            "apiVersion": "admission.k8s.io/v1",
            "kind": "AdmissionReview",
            "response": {
                "uid": body.request.uid,
                "allowed": false,
                "status": {
                    "code": 400,
                    "message": "Bad request - every pod should at least 2 replicas"
                }
            }
        }
    }
    return errorObject;
}

app.post('/validate', (req, res) => {
    console.log("VALIDATE REQUEST CALLED " + new Date().toString());
    res.set('Content-Type', 'application/json')
    let errorObject;
    try {
        console.log(JSON.stringify(req.body));
        errorObject = validate(req.body);
    } catch (e) {
        console.log(e);
    }
    if (errorObject) {
        res.status(200).json(errorObject);
    } else {
        res.status(200).json({
            "apiVersion": "admission.k8s.io/v1",
            "kind": "AdmissionReview",
            "response": {
                "uid": req.body.request.uid,
                "allowed": true
            }
        });
    }
});

https.createServer(options, app).listen(PORT, () => {
    console.log("phase final proper code experiments");
    console.log("server starting on port : " + PORT);
});

