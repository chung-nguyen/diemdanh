var express = require('express');
const { Meeting, Attendance } = require('../models');

var router = express.Router();

router.get('/', async function (req, res, next) {
  let { current, pageSize, sort, direction, join, ...filter } = req.query;

  current = Math.max(0, parseInt(String(current)) - 1);
  pageSize = parseInt(String(pageSize));
  let findCursor = Meeting.find(filter)
    .skip(current * pageSize)
    .limit(pageSize);

  if (sort) {
    findCursor = findCursor.sort({ [sort]: direction === 'ascend' ? 'asc' : 'desc' });
  }

  const [data, total] = await Promise.all([findCursor.exec(), Meeting.countDocuments(filter)]);

  res.status(200).json({ data, total, success: true });
});

router.get('/report/:id', async function (req, res, next) {
  const { id } = req.params;
  const [meeting, attendances] = await Promise.all([
    Meeting.findById(id).lean(),
    Attendance.find({ meetingId: id }).populate('guestId').lean(),
  ]);

  res.status(200).json({ success: true, data: { meeting, attendances } });
});

router.get('/:id', async function (req, res, next) {
  const { id } = req.params;
  const doc = await Meeting.findById(id);
  res.status(200).json({ data: doc, success: true });
});

router.delete('/', async function (req, res, next) {
  const { ids } = req.body;
  await Meeting.deleteMany({ _id: { $in: ids } });
  res.status(200).json({ success: true });
});

router.post('/', async function (req, res, next) {
  const doc = new Meeting(Object(req.body));
  await doc.save();
  res.status(200).json({ data: doc.toObject(), success: true });
});

// Update an existing Category
router.put('/:id', async function (req, res, next) {
  const { id } = req.params;
  const doc = await Meeting.findOneAndUpdate(
    { _id: id },
    Object.fromEntries(Object.entries(req.body).filter(([_, value]) => !!value)),
    { new: true }
  );
  res.status(200).json({ data: doc.toObject(), success: true });
});

module.exports = router;
