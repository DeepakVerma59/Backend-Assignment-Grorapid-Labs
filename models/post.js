var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('Post', PostSchema);