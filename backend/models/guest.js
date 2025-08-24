const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  _id: String,
  meetingId: { type: String, require: true, ref: 'Meeting' },
  seat: { type: Number, require: true },
  idNumber: String,
  phoneNumber: String,
  email: String,
  fullName: String,
  office: String,
  workplace: String,
});

schema.pre('save', function (next) {
  this._id = `${this.meetingId}:${this.seat}`;
  next();
});

schema.index({ meetingId: 1, seat: 1 }, { unique: true });
schema.index({ meetingId: 1 });

exports.Guest = mongoose.model('Guest', schema);

