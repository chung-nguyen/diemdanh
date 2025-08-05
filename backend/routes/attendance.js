var express = require('express');
const { Attendance, Guest } = require('../models');
const { AttendanceStatus } = require('../models/attendance');

var router = express.Router();

router.get('/', async function (req, res, next) {
  let { current, pageSize, sort, direction, join, ...filter } = req.query;

  current = Math.max(0, parseInt(String(current)) - 1);
  pageSize = parseInt(String(pageSize));
  let findCursor = Attendance.find(filter)
    .populate('guestId')
    .skip(current * pageSize)
    .limit(pageSize);

  if (sort) {
    findCursor = findCursor.sort({ [sort]: direction === 'ascend' ? 'asc' : 'desc' });
  }

  const [data, total] = await Promise.all([findCursor.exec(), Attendance.countDocuments(filter)]);

  res.status(200).json({ data, total, success: true });
});

router.get('/:id', async function (req, res, next) {
  const { id } = req.params;
  const doc = await Attendance.findById(id);
  res.status(200).json({ data: doc, success: true });
});

router.delete('/', async function (req, res, next) {
  const { ids } = req.body;
  await Attendance.deleteMany({ _id: { $in: ids } });
  res.status(200).json({ success: true });
});

router.post('/', async function (req, res, next) {
  let guestIdNumber = req.body.guestIdNumber;
  let guestId;

  if (guestIdNumber) {
    console.log(guestIdNumber)
    const guest = await Guest.findOne({ idNumber: guestIdNumber });
    guestId = guest._id;
  }

  if (!guestId) {
    throw new Error('Guest not found!');
  }

  const doc = new Attendance({
    meetingId: req.body.meetingId,
    guestId,
    seat: 0,
    status: AttendanceStatus.UNKNOWN,
    checkInTime: null,
  });
  await doc.save();
  res.status(200).json({ data: doc.toObject(), success: true });
});

// Update an existing Category
router.put('/:id', async function (req, res, next) {
  const { id } = req.params;
  const updateValues = Object.fromEntries(Object.entries(req.body).filter(([_, value]) => value != null && value != undefined));

  let guestUpdate;
  if (updateValues.guestId) {
    guestUpdate = updateValues.guestId;
    delete updateValues.guestId;
  }
  const doc = await Attendance.findOneAndUpdate(
    { _id: id },
    updateValues,
    { new: true }
  );
  if (Object.keys(guestUpdate).length > 0) {
    await Guest.findOneAndUpdate({ _id: doc.guestId }, guestUpdate)
  }
  res.status(200).json({ data: doc.toObject(), success: true });
});

module.exports = router;
