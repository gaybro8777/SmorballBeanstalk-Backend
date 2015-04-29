var Promise    = require('bluebird');
var rekt       = require('rekt');
var Book       = requireLocal('models/book.js');
var Page       = requireLocal('models/page.js');
var Difference = requireLocal('models/difference.js');
var _          = require('lodash');
var verifyWord = requireLocal('utils/compare.js');



function updateDifferences(unfilteredDifferences) {

  console.log(unfilteredDifferences);

  // nine passes MAX
  // Seperate passes
  // discard the passes

  // verify the rest,
  // Field is fine but the default should be not pass.
  // remerge passes and write to db

  if (unfilteredDifferences === 0) {
    return {};
  }

  // /**
  //  * Run our verifying algorithm on the unfilteredDifferences provided to us
  //  * by the user.
  //  */
  // var filtedDiffs = _.map(unfilteredDifferences, verifyWord);

  // /**
  //  * Because the verifyWord function is Async we have to wait for all of them
  //  * to either reject or verify. Once they all finish processing we can act on
  //  * them.
  //  */
  // return Promise.settle(filtedDiffs)
  //   .then(function(results) {
  //     var possibleDifferences = _.chain(results)
  //       .map(function(result) {
  //         if (result.isFulfilled() && result.value) {
  //           return result.value();
  //         } else {
  //           return false;
  //         }
  //       })
  //       .compact()
  //       .value();

  //     if (possibleDifferences.length < 1) {
  //       throw new rekt.BadWord('All words possible spam.');
  //     }

  //     return possibleDifferences;

  //   })
  //   .each(function(possibleDifference) {
  //     return Difference.findByIdAsync(possibleDifference._id)
  //       .then(function(foundDifference) {
  //         if (!foundDifference) {
  //           throw new rekt.NotFound('Difference not found');
  //         } else {
  //           return foundDifference;
  //         }
  //       })
  //       .then(function(foundDifference) {
  //         // If the possibleDifference is marked as passible and the max
  //         var index = _.findIndex(foundDifference.tags, {
  //           text: possibleDifference.text
  //         });
  //         if (index > -1) {
  //           var oldWeight = foundDifference.tags[index].weight;
  //           var newWeight = foundDifference.tags[index].weight + 1;
  //           foundDifference.tags.set(index, {
  //             text: possibleDifference.text,
  //             weight: newWeight
  //           });
  //           return foundDifference.saveAsync();
  //         } else {
  //           foundDifference.tags.push({
  //             text: possibleDifference.text,
  //             weight: 0
  //           });
  //           return foundDifference.saveAsync();
  //         }
  //       });
  //   });
}

module.exports = function(router) {
  router.route('/difference')
    .put(function(req, res) {
      var differences = req.body.differences;
      updateDifferences(differences)
        .then(function() {
          res.status(201);
          res.json({
            message: 'Differences updated'
          });
        })
        .catch(function(err) {
          console.log(err);
          res.send(err);
        });
    });
};
