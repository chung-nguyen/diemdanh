const mongoose = require('mongoose');

exports.Admin = mongoose.model('Admin', {
  _id: String,
  password: String,
  role: String
});
