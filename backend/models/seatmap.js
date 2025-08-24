const mongoose = require('mongoose');
const { Schema } = mongoose;

exports.SeatMap = mongoose.model('SeatMap', {
  _id: String,
  meetingId: {
    type: String,
    require: true,
    ref: 'Meeting'
  },
  day: {
    type: Number,
    require: true
  },
  seats: Schema.Types.Mixed,
  startRow: Number,
  startCol: Number,
  endRow: Number,
  endCol: Number,
});

exports.SeatMap.schema.pre('save', function (next) {
  this._id = `${this.meetingId}:${this.day}`;
  next();
});

exports.SeatMap.schema.index({ meetingId: 1, day: 1 }, { unique: true });
exports.SeatMap.schema.index({ meetingId: 1 });
