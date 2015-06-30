var Promise = require('bluebird');
var rekt    = require('rekt').rekt;
var Page    = requireLocal('models/page.js');
var _       = require('lodash');

// Returns a random unfinished page with at least n differences from the database
function getPage(n) {
  return new Promise(function(resolve, reject) {
    // Query based on state and number of differences
    var query = {state: {$ne: "done"}, $where: "this.differences.length > " + n};
    // First retrieve count, then use count to retrieve random page
    Page.count(query).exec(function(err, count) {
      if (err) { reject(err); }
      Page.findOne(query)
          .skip(Math.random() * count) // note: skip iterates across the collection, and may scale poorly
          .populate('differences')     //  see MongoDB issue SERVER-533 for future alternative
          .exec(function(err, page) {
            if (err) { reject(err); }
            // If there is no such page, go to the next query
            if (_.isNull(page)) {
              console.log('There is no page with at least', n, 'differences.');
              console.log('Sending random page');
              page = getRandomPage();
            // If there is such a page, check if it should be marked as done; if so, get a new one
            } else if (checkPageDone(page)) {
              page = getPage(n);
            }
            resolve(page);
      });
    });
  });
}

// Returns a random unfinished page from the database
function getRandomPage() {
  return new Promise(function(resolve, reject) {
    var query = {state: {$ne: "done"}};
    // First retrieve count, then use count to retrieve random page
    Page.count(query).exec(function(err, count) {
      if (err) { reject(err); }
      // Query just based on state
      Page.findOne(query)
          .skip(Math.random() * count) // see note about skip() above
          .populate('differences')
          .exec(function(err, page) {
            if (err) { reject(err); }
            // If there is no such page, go to the next query
            if (_.isNull(page)) {
              console.log('There are no unfinished pages');
              var error = new rekt.NotFound('No unfinished pages');
              reject(error);
              return;
            // If there is such a page, check if it should be marked as done; if so, get a new one
            } else if (checkPageDone(page)) {
              page = getRandomPage();
            }
            resolve(page);
      });
    });
  });
}

// Check if page should be marked as done. If so, update and save page
function checkPageDone(page) {
  var isDone = _.every(page.differences, function(d) { return d.state != "in_use"; });
  if (isDone) {
    console.log("Marking page as done:", page._id);
    page.state = "done";
    page.saveAsync();
  }
  return isDone;
}

module.exports = function(router) {
  router.route('/page')
    .get(function(req, res) {
      var minimumWords = req.query.wordAmount || 1;
      console.log('Trying to send page with at least', minimumWords, 'differences.');
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
