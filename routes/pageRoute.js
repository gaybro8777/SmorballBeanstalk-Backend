var Promise = require('bluebird');
var rekt    = require('rekt').rekt;
var Page    = requireLocal('models/page.js');
var _       = require('lodash');

function getPage(n) {
  console.log('Trying to send page with', n, 'differences.');
  return new Promise(function(resolve, reject) {
    Page.find({}).populate('differences').exec(function(err, pages) {
      if (err) { reject(err) }
      var returnPage;
      if (pages.length > 0) {
        returnPage = _(pages).shuffle().find(function(page) {
          return page.differences.length >= n;
        });

        if (_.isUndefined(returnPage)) {
          var randomPage = _.sample(pages, 1)[0];
          resolve(randomPage);
        } else {
          resolve(returnPage);
        }
      } else {
        var error = new rekt.NotFound('No Pages');
        reject(error);
      }
    });
  });
}

module.exports = function(router) {
  router.route('/page')
    .get(function(req, res) {
      var minimumWords = req.query.wordAmount || 20;
      getPage(minimumWords)
        .then(function(page) {
          res.status(200);
          res.send(page);
        })
        .catch(err, function(err) {
          console.log(err);
          res.send(err);
        });
    });
}
