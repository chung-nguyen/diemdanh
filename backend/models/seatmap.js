const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new mongoose.Schema({
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
})

schema.pre('save', function (next) {
  this._id = `${this.meetingId}:${this.day}`;
  next();
});

schema.index({ meetingId: 1, day: 1 }, { unique: true });
schema.index({ meetingId: 1 });

exports.SeatMap = mongoose.model('SeatMap', schema);
