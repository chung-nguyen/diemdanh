var express = require('express');
const { Guest } = require('../models');
const { MAX_SUGGESTIONS } = require('../config');

var router = express.Router();

router.get('/', async function (req, res, next) {
  let { current, pageSize, sort, direction, join, ...filter } = req.query;

  current = Math.max(0, parseInt(String(current)) - 1);
  pageSize = parseInt(String(pageSize));
  let findCursor = Guest.find(filter)
    .skip(current * pageSize)
    .limit(pageSize);

  if (sort) {
    findCursor = findCursor.sort({ [sort]: direction === 'ascend' ? 'asc' : 'desc' });
  }

  const [data, total] = await Promise.all([findCursor.exec(), Guest.countDocuments(filter)]);

  res.status(200).json({ data, total, success: true });
});

router.get('/search', async function (req, res, next) {
  const { q, c } = req.query;
  const results = await Guest.find({
    idNumber: { $regex: q, $options: 'i' },
  }).limit(Math.min(c || 0, MAX_SUGGESTIONS));
  res.status(200).json(results);
});

router.get('/:id', async function (req, res, next) {
  const { id } = req.params;
  const doc = await Guest.findById(id);
  res.status(200).json({ data: doc, success: true });
});

router.delete('/', async function (req, res, next) {
  const { ids } = req.body;
  await Guest.deleteMany({ _id: { $in: ids } });
  res.status(200).json({ success: true });
});

router.post('/', async function (req, res, next) {
  const doc = new Guest(Object(req.body));
  await doc.save();
  res.status(200).json({ data: doc.toObject(), success: true });
});

// Update an existing Category
router.put('/:id', async function (req, res, next) {
  const { id } = req.params;
  const doc = await Guest.findOneAndUpdate(
    { _id: id },
    Object.fromEntries(Object.entries(req.body).filter(([_, value]) => !!value)),
    { new: true }
  );
  res.status(200).json({ data: doc.toObject(), success: true });
});

module.exports = router;
