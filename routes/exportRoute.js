var Promise = require('bluebird');
var archiver = require('archiver');
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
      var differences = page.items[0].differences;
      page.items[0].differences = _.map(differences, function(diff) {
        var newDiff = {};
        var tagsByWeight = _(diff.tags).sortBy("weight").reverse().value();
        var tag1 = tagsByWeight[0]; //highest weight
        var tag2 = tagsByWeight[1]; //second-highest weight
        var confidence = tag1.weight / (tag1.weight + tag2.weight);
        var newTag = {};
        newTag.text = tag1;
        newTag.altText = tag2;
        newTag.score = _.isNaN(confidence) ? 0 : confidence;
        newDiff.id = diff.id;
        newDiff.state = diff.state;
        newDiff.tag = newTag;
        return newDiff;
      });
    });
    resolve(pages);
  });
}

function prepareZip(pages) {
  return new Promise(function(resolve, reject) {
    var zip = archiver.create('zip', {});
    var arr = [];
    var len = 0;
    zip.on('data', function(chunk) {
      arr.push(chunk);
      len += chunk.length;
    });
    zip.on('error', function(err){
      reject(err);
    });
    zip.on('end', function() {
      console.log("Stream completed; sending archive");
      resolve(Buffer.concat(arr, len));
    });
    _.forEach(pages, function(page) {
      //console.log(page);
      var fileName = page.items[0].barcode + '_' + page.items[0].id + '.json';
      zip.append(JSON.stringify(page), {name: 'export/' + fileName});
    });
    zip.finalize();
  });
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
