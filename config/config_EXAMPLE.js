/**
 * This is an example configuration file. To set up your own, copy this file to
 *  "config.js" and substitute your secret into the marked line below.
 *
 * Backend server for Smorball & Beanstalk
 * Tiltfactor, 2015
 */

module.exports = {
    productionDB: 'mongodb://localhost/BHLMaster',
    developmentDB: 'mongodb://localhost/BHLTesting',
    secret: /* enter secret here when creating config file */,
    ServerPort: 8081,
    /* The thresholds control when differences are marked as "tagged" or "passed"
     *  passes / (sum of weights + passes) > passedRatio
     *  (sum of weights + passes) > passedMin
     *  weight1 / (weight1 + weight2) > taggedRatio
     *  weight1 > taggedMin
     */
    thresholds: {
      passedRatio: .75,
      passedMin: 10,
      taggedRatio: .75,
      taggedMin: 8
    }
};
