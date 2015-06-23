var Promise    = require('bluebird');
var rekt       = require('rekt').rekt;
var Book       = requireLocal('models/book.js');
var Page       = requireLocal('models/page.js');
var Difference = requireLocal('models/difference.js');
var _          = require('lodash');
var verifyWord = requireLocal('utils/compare.js');
var config     = requireLocal('config/config.js');

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
          if (possible.pass === true) {
            foundDifference.passes++;
          } else {
            var index = _.findIndex(foundDifference.tags, {
              text: possible.text
            });
            if (index > -1) {
              var newWeight = foundDifference.tags[index].weight + 1;
              foundDifference.tags.set(index, {
                text: possible.text,
                weight: newWeight
              });
            } else {
              foundDifference.tags.push({
                text: possible.text,
                weight: 0
              });
            }
          }
          // Update state
          var weightSum = _(foundDifference.tags).pluck("weight").reduce(function(memo,num){ return memo + num; });
          var tagsByWeight = _(foundDifference.tags).sortBy("weight").reverse().value();
          var weight1 = tagsByWeight[0].weight; //highest weight
          var weight2 = tagsByWeight[1].weight; //second-highest weight
          var passes = foundDifference.passes;
          var markPassed = (passes / (weightSum + passes) > config.thresholds.passedRatio)
            && (weightSum + passes > config.thresholds.passedMin);
          var markTagged = (weight1 / (weight1 + weight2) > config.thresholds.taggedRatio)
            && (weight1 > config.thresholds.taggedMin);
          if (markPassed) {
            foundDifference.state = "passed";
          } else if (markTagged) {
            foundDifference.state = "tagged";
          } else {
            foundDifference.state = "in_use";
          }

          return foundDifference.saveAsync();
        });
    })
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
