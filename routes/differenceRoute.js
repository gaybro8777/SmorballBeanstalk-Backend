var Promise    = require('bluebird');
var rekt       = require('rekt').rekt;
var Book       = requireLocal('models/book.js');
var Page       = requireLocal('models/page.js');
var Difference = requireLocal('models/difference.js');
var _          = require('lodash');
var verifyWord = requireLocal('utils/compare.js');


/** @type {INT} The number of passes before we reject the request. */
var PASSCOUNT = 8;
function updateDifferences(unfilteredDifferences) {

  // nine passes MAX
  // Seperate passes
  // discard the passes

  // verify the rest,
  // Field is fine but the default should be not pass.
  // remerge passes and write to db

  var uniqueDiffs = _.uniq(unfilteredDifferences, '_id');
  var filteredDiffs = _.map(uniqueDiffs, verifyWord);
  return Promise.settle(filteredDiffs)
    .then(function(results) {

      /*==========  This whole section should be pulled out.  ==========*/
      var passCount = 0;
      _.forEach(uniqueDiffs, function(diff) {
        if (diff.pass === true) {
          passCount++;
        }
      });

      if (passCount > PASSCOUNT) {
        console.log('Too many passes');
        throw new rekt.BadRequest('Too many passes');
      }

      if (unfilteredDifferences === 0) {
        throw new rekt.BadRequest('You must provide diffs');
      }
      /*==========  This whole section should be pulled out.  ==========*/
      var possibleDifferences = _.chain(results)
        .map(function(result) {
          if (result.isFulfilled() && result.value) {
            return result.value();
          } else {
            return false;
          }
        })
        .compact()
        .value();
      if (possibleDifferences.length < 1) {
        throw new rekt.BadRequest('All words possible spam.');
      }
      return possibleDifferences;

    })
    .each(function(possible) {
      return Difference.findByIdAsync(possible._id)
        .then(function(foundDifference) {
          if (!foundDifference) {
            throw new rekt.NotFound('Difference not found');
          } else {
            return foundDifference;
          }
        })
        .then(function(foundDifference) {
          var index = _.findIndex(foundDifference.tags, {
            text: possible.text
          });
          var newPasses = 10;
          console.log(possible);
          if (possible.pass === true) {
            var prevPasses = foundDifference.passes;
            if (prevPasses) {
              newPasses = prevPasses + 1;
            } else {
              newPasses = prevPasses;
            }
          }
          if (index > -1) {
            var oldWeight = foundDifference.tags[index].weight;
            var newWeight = foundDifference.tags[index].weight + 1;
            foundDifference.tags.set(index, {
              text: possible.text,
              weight: newWeight
            });
            console.log(newPasses);
            foundDifference.passes = newPasses;
            return foundDifference.saveAsync();
          } else {
            foundDifference.tags.push({
              text: possible.text,
              weight: 0
            });
            console.log(newPasses);
            foundDifference.passes = newPasses;
            return foundDifference.saveAsync();
          }
        });
    })

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
