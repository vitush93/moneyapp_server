var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');

// configuration
var port = process.env.PORT || 80;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cookieParser());

// use morgan to log requests to the console
app.use(morgan('dev'));

// static routes
app.use('/', express.static(__dirname + '/public/'));
app.set('views', __dirname + '/public/');
app.get('/', function (req, res) {
    res.sendFile('index.html');
});

// API routes
var apiRoutes = express.Router();

apiRoutes.get('/', function (req, res) {
    res.json({message: "Welcome to the API."});
});

// authentication route
require('./app/routes/authenticate')(apiRoutes);
require('./app/routes/register')(apiRoutes);

// route middleware to verify a token
apiRoutes.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

// user
require('./app/routes/user')(apiRoutes);

// payment
require('./app/routes/pay')(apiRoutes);

app.use('/api', apiRoutes);

// error handler
app.use(function (err, req, res, next) {
    if (err) {
        console.log(err);

        res.status(500).send({
            success: false,
            message: 'internal application error',
            error: err
        });
    } else {
        next();
    }

});

// start the server
app.listen(port);
console.log('Magic happens at http://localhost:' + port);