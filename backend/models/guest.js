const mongoose = require('mongoose');

exports.Guest = mongoose.model('Guest', {
  email: String,
  fullName: String,
  office: String
});

exports.Guest.schema.index({ email: 1 });
