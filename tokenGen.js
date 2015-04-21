(function() {
  global._equire = function(name) {
    return require(__dirname + '/' + name);
  };
})();
var Token        = _equire('models/token.js');
var jwt          = require('jwt-simple');
var config       = _equire('config/config.js');
var commonIssuer = 'BHLServer';
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var mode         = process.env.NODE_ENV;

mongoose.connect(config.developmentDB);

function generateToken(payload) {
    var tokenSubject = payload.sub;
    var tokenString = jwt.encode(payload, config.secret);
    Token.find({
        subject: payload.sub
    }, function(err, result) {
        if (result) {
            Token.remove({
                subject: payload.sub
            }, function(err) {
                if (err) {
                    throw err;
                } else {
                    console.log('Previous token deleted.'.red);
                    var saveToken = new Token();
                    saveToken.token = tokenString;
                    saveToken.subject = tokenSubject;
                    saveToken.iat = payload.iat;
                    saveToken.save(function(err, result) {
                        console.log(result);
                        mongoose.connection.close();
                    });
                }
            });
        } else {
            var saveToken = new Token();
            saveToken.token = tokenString;
            saveToken.subject = tokenSubject;
            saveToken.save(function(err, result) {
                console.log(result);
                mongoose.connection.close();
            });
        }
    });
}

var prompt = require('prompt');
prompt.message = ":".green;
prompt.delimiter = "".green;
prompt.start();
prompt.get(['Subject'], function (err, result) {
    var date = new Date().getTime();
    var payload = {
        sub: result.Subject,
        iat: date,
        iss: 'BHLServer'
    };
    return generateToken(payload);
});
