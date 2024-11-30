const mongoose = require('mongoose');

exports.AttendanceStatus = {
  UNKNOWN: 0,
  CHECKED_IN: 1,
};

exports.Attendance = mongoose.model('Attendance', {
  meetingId: {
    type: mongoose.Types.ObjectId,
    ref: 'Meeting'
  },
  guestId: {
    type: mongoose.Types.ObjectId,
    ref: 'Guest'
  },
  seat: Number,
  status: Number,
  checkInTime: Date,
});

exports.Attendance.schema.index({ meetingId: 1, guestId: 1 }, { unique: true });
exports.Attendance.schema.index({ meetingId: 1 });
