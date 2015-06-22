var Promise  = require('bluebird');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var DifferenceSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  passes: {type: Number, default: 0},
  coords: [{}],
  texts: [String],
  tags: [{}],
  state: {type: String, default: "in_use"}
});

var Difference = mongoose.model('Difference', DifferenceSchema);
Promise.promisifyAll(Difference);
Promise.promisifyAll(Difference.prototype);
module.exports = Difference;
