const mongoose = require('mongoose');

exports.Guest = mongoose.model('Guest', {
  idNumber: String,
  phoneNumber: String,
  email: String,
  fullName: String,
  office: String,
  workplace: String
});

exports.Guest.schema.index({ idNumber: 1 });
