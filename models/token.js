var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TokenSchema = new Schema({
  token: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  iat: {
    type: Number,
    require: true
  }
});

var Token = mongoose.model('Token', TokenSchema);
module.exports = Token;
