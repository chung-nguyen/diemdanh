const mongoose = require('mongoose');

exports.Meeting = mongoose.model('Meeting', {
  name: String,
  time: Date,
  duration: Number,
  description: String,
  seatmapId: {
    type: mongoose.Types.ObjectId,
    ref: 'SeatMap'
  }
});
