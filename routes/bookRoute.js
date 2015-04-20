var Promise    = require('bluebird');
var rekt       = require('rekt').rekt;
var assert     = require('assert');
var _          = require('lodash');
var Book       = requireLocal('models/book.js');
var Page       = requireLocal('models/page.js');
var Difference = requireLocal('models/difference.js');

module.exports = function(router) {
  router.route('/book-import')
    .all(function(req, res, next) {
      console.log(req.token);
      if (req.token.sub === 'Tiltfactor' || req.token.sub === 'BHL') {
        next();
      } else {
        res.status(401);
        res.json({
          message: 'You don\'t have access to this.'
        });
      }
    })
    .post(function(req, res) {

      var books = req.body.items;
      console.log(books);
      res.end();

    });
}
