var Promise  = require('bluebird');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var DifferenceSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  passes: Number,
  coords: [{}],
  texts: [String],
  tags: [{}]
});

var Difference = mongoose.model('Difference', DifferenceSchema);
Promise.promisifyAll(Difference);
Promise.promisifyAll(Difference.prototype);
module.exports = Difference;
