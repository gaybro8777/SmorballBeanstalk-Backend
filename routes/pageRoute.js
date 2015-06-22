var Promise = require('bluebird');
var rekt    = require('rekt').rekt;
var Page    = requireLocal('models/page.js');
var _       = require('lodash');

function getPage(n) {
  console.log('Trying to send page with at least', n, 'differences.');
  return new Promise(function(resolve, reject) {
    Page.find({}).populate('differences').exec(function(err, pages) {
      if (err) { reject(err) }
      var returnPage;
      if (pages.length > 0) {
        pages = _.shuffle(pages);
        returnPage = _.find(pages, function(page) {
          if (page.state == "done") return false;
          var isDone = _.every(page.differences, function(d) { return d.state != "in_use"; });
          if (isDone) {
            console.log("Marking page as done: " + page._id);
            page.state = "done";
          }
          page.saveAsync();
          return !isDone && page.differences.length >= n;
        });
        if (_.isUndefined(returnPage)) {
          console.log('There is no page with at least', n, 'differences.');
          console.log('Sending random page');
          var randomPage = _.find(pages, function(page) {
            return page.state != "done";
          });
          if (_.isUndefined(returnPage)) {
            var error = new rekt.NotFound('No Pages');
            reject(error);
          }
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
      var minimumWords = req.query.wordAmount || 1;
      getPage(minimumWords)
        .then(function(page) {
          res.status(200);
          res.send(page);
        })
        .catch(function(err) {
          console.log(err);
          res.send(err);
        });
    });
}
