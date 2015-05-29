var Promise = require('bluebird');
var AdmZip  = require('adm-zip');
var base    = process.env.PWD;
var rekt    = require('rekt').rekt;
var Book    = requireLocal('models/book.js');
var Page    = requireLocal('models/page.js');
var _       = require('lodash');
var fs      = require('fs');

function getBooks() {
  return new Promise(function(resolve, reject) {
    Book.find({})
      .lean()
      .populate({
        path: 'pages'
      })
      .exec(function(err, pages) {
        var options = {
          path: 'pages.differences',
          model: 'Difference'
        };

        if (err) {
          reject(err);
        } else {
          Book.populate(pages, options, function(err, books) {
            if (err) reject(err);
            resolve(books);
          });
        }
      });
  });
}

function prepareBooks(books) {
  return new Promise(function(resolve, reject) {
    _.forEach(books, function(book) {
      book.pages = _.map(book.pages, function(page) {
        var newPage = {
          items: []
        };
        page.barcode = book.barcode;
        page.bookid  = book.id;
        page.pages   = page.differences;
        delete page.differences;
        delete page._id;
        delete page.__v;
        newPage.items.push(page);
        return newPage;
      });
    });
    resolve(books);
  })
  .then(function(books) {
    return Promise.map(books, function(book) {
      return book.pages;
    });
  })
  .then(function(pages) {
    return _.flatten(pages);
  });
}

function preparePages(pages) {
  return new Promise(function(resolve, reject) {
    _.forEach(pages, function(page) {
      var differences = page.items[0].pages;
      page.items[0].pages = _.map(differences, function(diff) {
        var newDiff = {};
        var tag = _.max(diff.tags, function(tag) {
          return tag.weight;
        });
        if (tag.toString() !== '-Infinity') {
          newDiff.tag = tag;
        } else {
          newDiff.tag = 'Not Tagged';
        }
        newDiff.id = diff.id;
        return newDiff;
      });
    });
    resolve(pages);
  });
}

function prepareZip(pages) {
  var zip = new AdmZip();
  _.forEach(pages, function(page) {
    console.log(page);
    var fileName = page.items[0].barcode + '_' + page.items[0].id + '.json';
    zip.addFile(fileName, JSON.stringify(page));
  });
  var willSendthis = zip.toBuffer();
  return willSendthis;
}

module.exports = function(router) {
  router.route('/export.zip')
    .get(function(req, res) {
      getBooks()
        .then(prepareBooks)
        .then(preparePages)
        .then(prepareZip)
        .then(function(zip) {
          res.send(zip);
        })
        .catch(rekt.NotFound, function(err) {
          console.log(err);
          res.send(err);
        })
        .catch(function(err) {
          console.log(err);
          res.send(err);
        });
    });
};
