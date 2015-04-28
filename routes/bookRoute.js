var Promise    = require('bluebird');
var rekt       = require('rekt').rekt;
var assert     = require('assert');
var _          = require('lodash');
var Book       = requireLocal('models/book.js');
var Page       = requireLocal('models/page.js');
var Difference = requireLocal('models/difference.js');

/** If difference with id exists we want to throw it out. */
function mergeBooks(books) {
  return new Promise(function(resolve, reject) {
    if (!_.isUndefined(books)) {
      var finalBooks = {};
      _.forEach(books, function(book) {
        var raw = book.items[0];
        finalBooks[raw.id] = finalBooks[raw.id] || {
          id: raw.id,
          barcode: raw.barcode,
          pages: []
        };
        _.forEach(raw.pages, function(page) {
          console.log(page.differences.length);
          if (page.differences.length > 0) {
            finalBooks[raw.id].pages.push(page);
          }
        });
      });
      resolve(finalBooks);
    } else {
      reject(new rekt.BadRequest('You must provide books to import'));
    }
  });
}

function prepareBooks(books) {
  return Promise.map(_.keys(books), function(bookKey) {
    var bookPages = books[bookKey].pages;
    return Promise.map(bookPages, function(page) {
      Page.findOneAsync({
        id: page.id
      })
      .bind(page)
      .then(function(match) {
        if (match) {
          return undefined;
        } else {
          return prepareDifferences(page)
            .then(function(page) {
              console.log('Would save page.');
            });
        }
      });
    });
  });
}

function prepareDifferences(page) {
  return Promise.map(page.differences, function(difference) {
    difference.tags = difference.tags || [];
    difference.passes = 0;
    _.forEach(difference.texts, function(text) {
      this.tags.push({
        text: text,
        weight: 0
      });
    }, difference);
    return difference;
  });
}

function saveDifferences(differences) {
  return Promise.map(differences, function(difference) {
    var newDifference = new Difference();
    newDifference.id = difference.id;
    newDifference.tags = difference.tags;
    newDifference.texts = difference.texts;
    newDifference.coords = difference.coords;
    return newDifference.saveAsync().bind(difference)
      .get(0)
      .then(function(result) {
        return result._id;
      });
  });
}

module.exports = function(router) {
  router.route('/book-import')
    .all(function(req, res, next) {
      if (req.token.subject === 'Tiltfactor' || req.token.subject === 'BHL') {
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
      mergeBooks(books)
        .then(prepareBooks)
        .then(function() {
          res.end();
        })
        .catch(function(err) {
          res.send(err);
        });
    });
}
