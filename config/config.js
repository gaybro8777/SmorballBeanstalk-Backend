module.exports = {
    productionDB: 'mongodb://localhost/BHLMaster',
    developmentDB: 'mongodb://localhost/BHLTesting',
    secret: 'zsZ,OgPp{W>wj:;`UB^Y3xh&Eg;e1:VTsrCv[%6*Y)Z>YS`bFSUmRvgDwEm!FOhe',
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
