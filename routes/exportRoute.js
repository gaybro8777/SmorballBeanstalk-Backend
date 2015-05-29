var Promise = require('bluebird');
var AdmZip  = require('adm-zip');
var base    = process.env.PWD;
var rekt    = require('rekt').rekt;
var Book    = requireLocal('models/book.js');
var Page    = requireLocal('models/page.js');
var _       = require('lodash');
var fs      = require('fs');

module.exports = function(router) {
  router.route('/export.zip')
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
    .get(function(req, res) {
      getBooks()
        .then(function(books) {
          res.send(books);
        });
    });
};

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
          reject(err)
        } else {
          Book.populate(pages, options, function(err, books) {
            if (err) {
              reject(err)
            }
            resolve(books);
          });
        }
      });
  }).then(prepareBooks).then(console.log)
}


// function getBooks() {
//   return new Promise(function(resolve, reject) {
//     Book.find({})
//       .lean()
//       .populate({
//         path: 'pages'
//       })
//       .exec(function(err, pages) {
//         var options = {
//           path: 'pages.differences',
//           model: 'Difference'
//         };

//         if (err) {
//           reject(err);
//         } else {
//           Book.populate(pages, options, function(err, books) {
//             if (err) reject(err);
//             resolve(books);
//           });
//         }
//       });
//   });
// }

function prepareBooks(books) {
  return Promise.map(books, function(book) {
    return {
      items: [{
        id: book.id,
        barcode: book.barcode,
        pages: []
      }],
      oldBook: book
    };
  })
  .then(function(newBooks) {
    return Promise.map(newBooks, function(book) {
      var pages = book.oldBook.pages;
      _.forEach(pages, function(page) {
        book.items[0].pages.push({
          id: page.id,
          differences: page.differences
        });
      });
      return book;
    });
  })
  .then(function(newBooks) {
    return Promise.map(newBooks, function(book) {
      var differences = book.item[0].pages[0].differences;
    });
  });
}


// module.exports = function(router) {
//   router.route('/export.zip')
//     .get(function(req, res) {
//       getBooks()
//         .then(prepareBooks)
//         .then(preparePages)
//         .then(prepareZip)
//         .then(function(zip) {
//           res.send(zip);
//         });
//     });
// };
