/*
 * Biodiversity Heritage Library
 * A backend for collecting OCR corrections from BHL games.
 * Copyright 2015 Tiltfactor
 */

(function() {
  global.requireLocal = function(name) {
    return require(__dirname + '/' + name);
  };
})();

var express    = require('express');
var bodyParser = require('body-parser');
var http       = require('http');
var cors       = require('cors');
var mongoose   = require('mongoose');

var config     = requireLocal('config/config.js');
var PORT       = process.env.PORT || config.ServerPort || 8081;

var app = express();
/** Connect to our database */
mongoose.connect(config.developmentDB);

/** Allow cross domain requests */
app.use(cors());

/** Initialize our routing logic */
var router = express.Router();
requireLocal('routes')(router);

/** Allows us to parse body and query parameters */
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/** Remove the 'Powered by Express' header. */
app.disable('x-powered-by');

/** Set the root of our routes to be /api */
app.use('/api', router);

app.get('/', function(req, res) {
  /** Will eventually send a better message */
  res.send('Hello did you get lost?');
});

http.createServer(app).listen(PORT, function() {
  console.log('Started on:', PORT);
});
