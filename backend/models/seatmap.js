const mongoose = require('mongoose');
const { Schema } = mongoose;

exports.SeatMap = mongoose.model('SeatMap', {
  meetingId: {
    type: mongoose.Types.ObjectId,
    ref: 'Meeting'
  },
  seats: Schema.Types.Mixed,
  startRow: Number,
  startCol: Number,
  endRow: Number,
  endCol: Number,
});
