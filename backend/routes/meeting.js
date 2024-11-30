var path = require('path');
var express = require('express');
var Excel = require('exceljs');
const { Meeting, Attendance } = require('../models');
const { DEFAULT_SETTINGS } = require('../config');

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

router.post('/import', async function (req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  sampleFile = req.files.file;
  uploadPath = DEFAULT_SETTINGS.uploadPath;

  const destFilePath = path.join(uploadPath, sampleFile.name);
  sampleFile.mv(destFilePath, async function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false });
      return;
    }

    await analyzeMeetingSheet(destFilePath);

    res.status(200).json({ success: true });
  });
});

async function analyzeMeetingSheet(filePath) {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(filePath);

  if (!workbook) {
    res.status(500).json({ success: false });
    return;
  }

  const worksheet = workbook.worksheets[0];
  console.log(worksheet);

  worksheet.eachRow(function (row, rowNumber) {
    console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
  });
}

module.exports = router;
