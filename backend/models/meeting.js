const mongoose = require('mongoose');
const { deterministicHash, stringToSlug } = require('../utils/hash-utils');

const schema = new mongoose.Schema({
  _id: String,
  name: String,
  slug: String,
  time: Date,
  duration: Number,
  description: String,
  daysCount: Number
});

schema.statics.genId = function (name) {
  const slug = stringToSlug(name);
  return deterministicHash(slug, 12);
};

schema.pre('save', function (next) {
  const slug = stringToSlug(this.name);
  this._id = deterministicHash(slug, 12);
  this.slug = slug;
  next();
});

exports.Meeting = mongoose.model('Meeting', schema);
