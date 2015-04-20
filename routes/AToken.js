var Promise = require('bluebird');
var rekt    = require('rekt');
var Token   = requireLocal('models/token.js');
var config  = requireLocal('config/config.js');
var jwt     = require('jwt-simple');
var _       = require('lodash');


/** Wraps jwt.decode into a promise */
function decode(token, secret) {
  return new Promise(function(resolve, reject) {
    if (_.isUndefined(token)) {
      reject(new rekt.BadRequest('Every request must include a token.'));
    } else {
      try {
        var decoded = jwt.decode(token, secret);
        resolve(decoded);
      } catch (err) {
        var error = new rekt.BadRequest('Badly formed token.');
        reject(error);
      }
    }
  });
}

/**
 * Attempts to find a token in the database with the decoded subject and
 * resolves with the result.
 */
function validateToken(decoded) {
  var subject = decoded.sub;
  return new Promise(function(resolve, reject) {
    if (_.isUndefined(subject)) {
      var error = new rekt.BadRequest('Token needs subject field.');
      reject(error);
    }
    Token.findOne({
      subject: subject
    }, function(err, result) {
      if (err) {
        var error = new rekt.BadRequest('Invalid Token');
        console.log(['Invalid', ip, subject, url, verb].join(' | '));
        reject(error);
      } else if (result) {
        console.log('Requested by', subject);
        resolve(result);
      }
    });
  });
}

module.exports = function(router) {
  router.use('/', function(req, res, next) {
    var url  = req.protocol + '://' + req.get('host') + req.originalUrl;
    var ip   = req.ip;
    var verb = req.method;

    var token = (req.body && req.body.access_token)   ||
                (req.query && req.query.access_token) ||
                req.headers['x-access-token'];

    if (!_.isUndefined(token)) {
      decode(token, config.secret)
        .then(validateToken)
        .then(function(result) {

          next();
        })
        .catch(function(err) {
          console.log(err);
          res.status(err.status);
          res.send(err);
        });
    } else {
      var err = new rekt.BadRequest('Missing Token');
      console.log(['Missing', ip, url, verb].join(' | '));
      res.status(err.status);
      res.send(err);
    }
  });
}
