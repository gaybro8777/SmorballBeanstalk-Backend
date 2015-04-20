var Promise  = require('bluebird');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var PageSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  shouldShow: Boolean,
  differences: [{
    type: Schema.Types.ObjectId,
    ref: 'Difference'
  }]
});

var Page = mongoose.model('Page', PageSchema);
Promise.promisifyAll(Page);
Promise.promisifyAll(Page.prototype);
module.exports = Page;
