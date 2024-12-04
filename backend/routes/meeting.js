var path = require('path');
var fs = require('fs');
var express = require('express');
var Excel = require('exceljs');
var QRCode = require('qrcode');

const { Meeting, Attendance, Guest } = require('../models');
const { DEFAULT_SETTINGS } = require('../config');
const { AttendanceStatus } = require('../models/attendance');

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

router.get('/checkin-url', function (req, res, next) {
  res.status(200).send(DEFAULT_SETTINGS.checkInURL);
});

router.get('/generate/:id', async function (req, res, next) {
  const { id } = req.params;
  const [meeting, attendances] = await Promise.all([
    Meeting.findById(id).lean(),
    Attendance.find({ meetingId: id }).sort({ seat: 1 }).populate('guestId').lean(),
  ]);

  await generateExcelInviteSheet(meeting, attendances);

  res.status(200).json({ success: true });
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

    const meeting = await analyzeMeetingSheet(destFilePath);
    if (!meeting) {
      console.error('Could not save meeting');
      res.status(500).json({ success: false });
      return;
    }

    res.status(200).json({ success: true, meeting });
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

  const headerColumnIndex = {
    idNumber: 0,
    fullName: 0,
    office: 0,
    workplace: 0,
  };

  let promises = [];

  let meetingName = '';
  let headerRowScanned = false;
  worksheet.eachRow(function (row, rowNumber) {    
    if (!headerRowScanned) {
      row.values.forEach((value, index) => {
        if (!value) {
          return;
        }

        if (!meetingName) {
          meetingName = value;
        }

        if (value.toLowerCase().includes('cccd')) {
          headerRowScanned = true;
          headerColumnIndex.idNumber = index;
        } else if (value.toLowerCase().includes('tên')) {
          headerRowScanned = true;
          headerColumnIndex.fullName = index;
        } else if (value.toLowerCase().includes('chức')) {
          headerRowScanned = true;
          headerColumnIndex.office = index;
        } else if (value.toLowerCase().includes('đơn vị')) {
          headerRowScanned = true;
          headerColumnIndex.workplace = index;
        }
      });
    } else {
      promises.push(addMissingGuestFromExcel(headerColumnIndex, row.values));
    }
  });

  const guestIds = await Promise.all(promises);

  const meeting = new Meeting({
    name: meetingName,
    time: new Date(),
    duration: 1,
    description: meetingName,
  });

  await meeting.save();
  const meetingId = meeting._id;
  if (!meetingId) {
    return;
  }

  await Promise.all(
    guestIds.map((guestId, index) => {
      const attendance = new Attendance({
        meetingId,
        guestId,
        seat: index + 1,
        status: AttendanceStatus.UNKNOWN,
        checkInTime: null,
      });
      return attendance.save();
    })
  );

  return meeting.toObject();
}

async function addMissingGuestFromExcel(headerColumnIndex, values) {
  let idNumber = String(values[headerColumnIndex.idNumber]);
  if (!idNumber) {
    return;
  }

  if (idNumber.length < 12) {
    idNumber = idNumber.padStart(12, '0');
  }

  let guest = await Guest.findOne({ idNumber });
  if (guest) {
    guest.fullName = values[headerColumnIndex.fullName] || guest.fullName;
    guest.office = values[headerColumnIndex.office] || guest.office;
    guest.workplace = values[headerColumnIndex.workplace] || guest.workplace;
    await guest.save();
  } else {
    guest = new Guest({
      idNumber,
      fullName: values[headerColumnIndex.fullName],
      office: values[headerColumnIndex.office],
      workplace: values[headerColumnIndex.workplace],
    });
    await guest.save();
  }

  return guest._id;
}

async function generateExcelInviteSheet(meeting, attendances) {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  worksheet.pageSetup.margins = {
    left: 0.25,
    right: 0.25,
    top: 0.5,
    bottom: 0.5,
  };

  const title = worksheet.addRow([meeting.name]);
  title.height = 40;
  title.getCell(1).style = { font: { bold: true, size: 16 } };  

  const header = worksheet.addRow(['STT', 'Số CCCD', 'Họ và tên', 'Chức vụ', 'Đơn vị', 'Mã QR', 'Hình ảnh']);
  for (let i = 1; i <= 7; ++i) {
    header.getCell(i).style = { font: { bold: true, size: 8 } };
    header.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
    header.getCell(i).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    header.getCell(i).margins = {
      insetmode: 'custom',
      inset: [0.25, 0.25, 0.35, 0.35],
    };
  }

  worksheet.getColumn(1).width = 4;
  worksheet.getColumn(2).width = 12;
  worksheet.getColumn(3).width = 26;
  worksheet.getColumn(4).width = 12;
  worksheet.getColumn(5).width = 17;
  worksheet.getColumn(6).width = 16;
  worksheet.getColumn(7).width = 16;

  worksheet.addRow([null]);

  attendances.forEach((attendance, index) => {
    const guest = attendance.guestId;

    const row = worksheet.addRow([index + 1, guest.idNumber, guest.fullName, guest.office, guest.workplace]);
    row.height = 100;
    for (let i = 1; i <= 7; ++i) {
      row.getCell(i).style = { font: { size: 8 } };
      row.getCell(i).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      row.getCell(i).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  });

  const qrImageIDs = await Promise.all(
    attendances.map(async (attendance, index) => {
      const checkInURL = DEFAULT_SETTINGS.checkInURL + '/' + Buffer.from(String(attendance._id)).toString('base64');

      const qrCode = await generateQRCodeBase64(checkInURL);
      if (qrCode) {
        const qrImageID = workbook.addImage({
          base64: qrCode,
          extension: 'jpeg',
        });

        return qrImageID;
      }

      return -1;
    })
  );

  console.log(qrImageIDs);

  // Imaging
  attendances.forEach((attendance, index) => {
    const guest = attendance.guestId;

    if (qrImageIDs[index] >= 0) {
      worksheet.addImage(qrImageIDs[index], {
        tl: { col: 5.125, row: index + 3.125 },
        ext: { width: 110, height: 110 },
        editAs: 'oneCell',
      });
    }

    const guestPhotoFilePath = path.join(DEFAULT_SETTINGS.photoPath, guest.idNumber + '.jpg');
    if (fs.existsSync(guestPhotoFilePath)) {
      const guestPhotoID = workbook.addImage({
        filename: guestPhotoFilePath,
        extension: 'jpeg',
      });

      worksheet.addImage(guestPhotoID, {
        tl: { col: 6.125, row: index + 3.125 },
        ext: { width: 110, height: 110 },
        editAs: 'oneCell',
      });
    }
  });

  await workbook.xlsx.writeFile(path.join(DEFAULT_SETTINGS.reportPath, meeting.name + '.xlsx'));
}

const generateQRCodeBase64 = async (text) => {
  try {
    const base64 = await QRCode.toDataURL(text, {
      margin: 0,
    });
    return base64;
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
  return undefined;
};

module.exports = router;
