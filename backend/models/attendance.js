const mongoose = require('mongoose');

exports.AttendanceStatus = {
  UNKNOWN: 0,
  CHECKED_IN: 1,
};

const schema = new mongoose.Schema({
  _id: String,
  meetingId: { type: String, require: true, ref: 'Meeting' },
  seat: { type: Number, require: true },
  day: { type: Number, require: true },  
  guestId: { type: String, require: true, ref: 'Guest' },
  status: Number,
  checkInTime: Date,
});

schema.pre('save', function (next) {
  this._id = `${this.meetingId}:${this.seat}:${this.day}`;
  this.guestId = `${this.meetingId}:${this.seat}`;
  next();
});

schema.index({ meetingId: 1, guestId: 1, day: 1 }, { unique: true });
schema.index({ meetingId: 1, day: 1 });

exports.Attendance = mongoose.model('Attendance', schema);

