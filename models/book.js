var Promise  = require('bluebird');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var BookSchema = new Schema({
  id: Number,
  barcode: {
    type: String,
    required: true
  },
  pages: [{
    type: Schema.Types.ObjectId,
    ref: 'Page'
  }]
});

var Book = mongoose.model('Book', BookSchema);
Promise.promisifyAll(Book);
Promise.promisifyAll(Book.prototype);
module.exports = Book;
