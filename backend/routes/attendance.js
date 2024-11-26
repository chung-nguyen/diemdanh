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
  if (req.body.guestEmail) {
    const guest = await Guest.findOne({ email: req.body.guestEmail });
    delete req.body.guestEmail;

    req.body.guestId = guest._id;
  }

  const doc = new Attendance(Object(req.body));
  doc.status = doc.status || AttendanceStatus.UNKNOWN;
  await doc.save();
  res.status(200).json({ data: doc.toObject(), success: true });
});

// Update an existing Category
router.put('/:id', async function (req, res, next) {
  const { id } = req.params;
  const doc = await Attendance.findOneAndUpdate(
    { _id: id },
    Object.fromEntries(Object.entries(req.body).filter(([_, value]) => value != null && value != undefined)),
    { new: true }
  );
  res.status(200).json({ data: doc.toObject(), success: true });
});

module.exports = router;
