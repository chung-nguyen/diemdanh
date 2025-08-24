var path = require('path');
var fs = require('fs');
var express = require('express');
var Excel = require('exceljs');
var PDFDocument = require('pdfkit');
var QRCode = require('qrcode');

const { Meeting, Attendance, Guest } = require('../models');
const { DEFAULT_SETTINGS } = require('../config');
const { AttendanceStatus } = require('../models/attendance');
const { SeatMap } = require('../models/seatmap');
const { getQRCodeLink } = require('./common/qrcodes');

var router = express.Router();

router.get('/', async function (req, res, next) {
  let { current, pageSize, sort, direction, join, ...filter } = req.query;

  current = Math.max(0, parseInt(String(current)) - 1);
  pageSize = parseInt(String(pageSize));
  let findCursor = Meeting.find(filter)
    .skip(current * pageSize)
    .limit(pageSize);

  if (sort) {
    findCursor = findCursor.sort({
      [sort]: direction === 'ascend' ? 'asc' : 'desc',
    });
  }

  const [data, total] = await Promise.all([
    findCursor.exec(),
    Meeting.countDocuments(filter),
  ]);

  res.status(200).json({ data, total, success: true });
});

router.get('/checkin-url', function (req, res, next) {
  res.status(200).send(DEFAULT_SETTINGS.checkInURL);
});

router.get('/generate/:id', async function (req, res, next) {
  const { id } = req.params;
  const [meeting, attendances] = await Promise.all([
    Meeting.findById(id).lean(),
    Attendance.find({ meetingId: id })
      .sort({ seat: 1 })
      .populate('guestId')
      .lean(),
  ]);

  await generateExcelInviteSheet(meeting, attendances);

  res.status(200).json({ success: true });
});

router.get('/print/:id', async function (req, res, next) {
  const { id } = req.params;
  const guests = await Guest.find({ meetingId: id }).lean();

  guests.sort((a, b) => a.seat - b.seat);
  await printQRCodesSheet(res, guests);
});

router.get('/report/:id', async function (req, res, next) {
  const { id } = req.params;
  const day = parseInt(req.query.d);
  const [meeting, attendances] = await Promise.all([
    Meeting.findById(id).lean(),
    Attendance.find({ meetingId: id, day }).populate('guestId').lean(),
  ]);

  res.status(200).json({ success: true, data: { meeting, attendances } });
});

router.get('/reset/:id', async function (req, res, next) {
  const { id } = req.params;
  const day = parseInt(req.query.d);

  const [meeting, attendances] = await Promise.all([
    Meeting.findById(id).lean(),
    Attendance.find({ meetingId: id, day }).lean(),
  ]);

  // Backup first
  const today = new Date();
  const todayString =
    today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0') +
    '-' +
    String(today.getHours()).padStart(2, '0') +
    String(today.getMinutes()).padStart(2, '0') +
    String(today.getSeconds()).padStart(2, '0');
  const backupFilePath = path.join(
    DEFAULT_SETTINGS.outputPath,
    'backup - ' + meeting.name + ' - ' + todayString + '.json'
  );
  await fs.promises.writeFile(
    backupFilePath,
    JSON.stringify(attendances),
    'utf-8'
  );

  await Attendance.updateMany(
    { meetingId: id, day },
    { status: AttendanceStatus.UNKNOWN }
  );

  res.status(200).json({ success: true, data: {} });
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
    Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => !!value)
    ),
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

router.post('/import-addendum/:meeting', async function (req, res) {
  const meetingId = req.params.meeting;

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

    const meeting = await analyzeMeetingSheet(destFilePath, meetingId);
    if (!meeting) {
      console.error('Could not save meeting');
      res.status(500).json({ success: false });
      return;
    }

    res.status(200).json({ success: true, meeting });
  });
});

router.post('/import-seatmap/:meeting', async function (req, res) {
  const meetingId = req.params.meeting;
  const day = parseInt(req.body.day);

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

    const meeting = await updateSeatMap(meetingId, day, destFilePath);
    if (!meeting) {
      console.error('Could not save meeting');
      res.status(500).json({ success: false });
      return;
    }

    res.status(200).json({ success: true, meeting });
  });
});

async function updateSeatMap(meetingId, day, filePath) {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(filePath);

  if (!workbook) {
    throw new Error('Failed to read worksheet');
  }

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  const seats = {};
  const worksheet = workbook.worksheets[0];
  for (let row = 1; row <= worksheet.actualRowCount; ++row) {
    const sheetRow = worksheet.getRow(row);
    for (let col = 1; col <= worksheet.actualColumnCount; ++col) {
      const cell = sheetRow.getCell(col);
      if (cell) {
        seats[`${row}:${col}`] = {
          value: cell.value,
          fill: cell.fill,
        };
      }
    }
  }

  const seatMap = new SeatMap({
    meetingId,
    day,
    seats,
  });

  await seatMap.save();

  return seatMap;
}

async function analyzeMeetingSheet(filePath, meetingId) {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(filePath);

  if (!workbook) {
    res.status(500).json({ success: false });
    return;
  }

  const worksheet = workbook.worksheets[0];

  const headerColumnIndex = {
    seat: 0,
    idNumber: 0,
    fullName: 0,
    office: 0,
    workplace: 0,
    phoneNumber: 0,
  };

  let meetingName = '';
  let headerRowScanned = false;
  let guestData = [];
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
        } else if (value.toLowerCase().includes('ghế')) {
          headerRowScanned = true;
          headerColumnIndex.seat = index;
        } else if (value.toLowerCase().includes('tên')) {
          headerRowScanned = true;
          headerColumnIndex.fullName = index;
        } else if (value.toLowerCase().includes('chức')) {
          headerRowScanned = true;
          headerColumnIndex.office = index;
        } else if (value.toLowerCase().includes('đơn vị')) {
          headerRowScanned = true;
          headerColumnIndex.workplace = index;
        } else if (
          value.toLowerCase().includes('đt') ||
          value.toLowerCase().includes('điện thoại')
        ) {
          headerRowScanned = true;
          headerColumnIndex.phoneNumber = index;
        }
      });
    } else {
      guestData.push(row.values);
    }
  });

  meetingId = meetingId || Meeting.genId(meetingName);

  let meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    meeting = new Meeting({
      name: meetingName,
      time: new Date(),
      duration: 1,
      daysCount: 1,
      description: meetingName,
    });

    await meeting.save();
  }

  const lastGuest = await Guest.findOne({ meetingId })
    .sort({ seat: -1 })
    .lean();
  const lastSeatIndex = lastGuest?.seat || 0;

  await Promise.all(
    guestData.map((data, index) =>
      addMissingGuestFromExcel(
        headerColumnIndex,
        meetingId,
        data,
        lastSeatIndex + index
      )
    )
  );

  return meeting.toObject();
}

async function addMissingGuestFromExcel(
  headerColumnIndex,
  meetingId,
  values,
  index
) {
  let seat = parseInt(values[headerColumnIndex.seat]);
  if (isNaN(seat)) {
    seat = index + 1;
  }

  let guest = await Guest.findOne({ meetingId, seat });
  if (guest) {
    guest.idNumber = values[headerColumnIndex.idNumber] || guest.idNumber;
    guest.fullName = values[headerColumnIndex.fullName] || guest.fullName;
    guest.office = values[headerColumnIndex.office] || guest.office;
    guest.workplace = values[headerColumnIndex.workplace] || guest.workplace;
    guest.phoneNumber =
      values[headerColumnIndex.phoneNumber] || guest.phoneNumber;
    await guest.save();
  } else {
    guest = new Guest({
      meetingId,
      seat,
      idNumber: values[headerColumnIndex.idNumber],
      fullName: values[headerColumnIndex.fullName],
      office: values[headerColumnIndex.office],
      workplace: values[headerColumnIndex.workplace],
      phoneNumber: values[headerColumnIndex.phoneNumber],
    });
    await guest.save();
  }

  return guest._id;
}

async function printQRCodesSheet(res, guests) {
  // === SETTINGS ===
  const cmToPt = (cm) => (cm / 2.54) * 72; // convert cm to points

  const frameWidth = cmToPt(5);
  const frameHeight = cmToPt(6.5);
  const qrSize = cmToPt(4.5);
  const spacing = cmToPt(1);

  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
  });

  doc.pipe(res);

  // TODO: check this when integrate into Electron
  doc.registerFont(
    'Roboto-Bold',
    path.join(__dirname, '../data/Roboto-Bold.ttf')
  );

  let x = spacing;
  let y = spacing;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    const checkInURL = getQRCodeLink(guest);

    // Generate QR code
    const qrData = await QRCode.toBuffer(checkInURL, {
      width: qrSize,
      margin: 0,
    });

    // Draw frame border
    doc.rect(x, y, frameWidth, frameHeight).stroke();

    // Draw QR code inside frame
    doc.image(qrData, x + (frameWidth - qrSize) / 2, y + cmToPt(0.25), {
      width: qrSize,
      height: qrSize,
    });

    // Draw text (name + id)
    doc
      .font('Roboto-Bold')
      .fontSize(10)
      .text(`${guest.fullName}`, x, y + qrSize + cmToPt(0.625), {
        width: frameWidth,
        align: 'center',
      });
    doc
      .font('Roboto-Bold')
      .fontSize(12)
      .text(`${guest.seat}`, x, y + qrSize + cmToPt(1.125), {
        width: frameWidth,
        align: 'center',
      });

    // Move position for next frame
    x += frameWidth + spacing;
    if (x + frameWidth + spacing > pageWidth) {
      x = spacing;
      y += frameHeight + spacing;
    }

    // If next frame won't fit vertically, start a new page
    if (y + frameHeight + spacing > pageHeight && i < guests.length - 1) {
      doc.addPage();
      x = spacing;
      y = spacing;
    }
  }

  doc.end();
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

  const header = worksheet.addRow([
    'STT',
    'Số CCCD',
    'Họ và tên',
    'Chức vụ',
    'Đơn vị',
    'Số ĐT',
    'Mã QR',
    'Hình ảnh',
  ]);
  for (let i = 1; i <= 8; ++i) {
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
  worksheet.getColumn(3).width = 21;
  worksheet.getColumn(4).width = 12;
  worksheet.getColumn(5).width = 12;
  worksheet.getColumn(6).width = 10;
  worksheet.getColumn(7).width = 16;
  worksheet.getColumn(8).width = 16;

  worksheet.addRow([null]);

  attendances.forEach((attendance, index) => {
    const guest = attendance.guestId;

    const row = worksheet.addRow([
      index + 1,
      guest.idNumber,
      guest.fullName,
      guest.office,
      guest.workplace,
      guest.phoneNumber,
    ]);
    row.height = 100;
    for (let i = 1; i <= 8; ++i) {
      row.getCell(i).style = { font: { size: 8 } };
      row.getCell(i).alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
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
      const checkInURL = getQRCodeLink(attendance);

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

  // Imaging
  attendances.forEach((attendance, index) => {
    const guest = attendance.guestId;

    if (qrImageIDs[index] >= 0) {
      worksheet.addImage(qrImageIDs[index], {
        tl: { col: 6.125, row: index + 3.125 },
        ext: { width: 110, height: 110 },
        editAs: 'oneCell',
      });
    }

    const guestPhotoFilePath = path.join(
      DEFAULT_SETTINGS.photoPath,
      guest.idNumber + '.jpg'
    );
    if (fs.existsSync(guestPhotoFilePath)) {
      const guestPhotoID = workbook.addImage({
        filename: guestPhotoFilePath,
        extension: 'jpeg',
      });

      worksheet.addImage(guestPhotoID, {
        tl: { col: 7.125, row: index + 3.125 },
        ext: { width: 110, height: 110 },
        editAs: 'oneCell',
      });
    }
  });

  await workbook.xlsx.writeFile(
    path.join(DEFAULT_SETTINGS.reportPath, meeting.name + '.xlsx')
  );
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

function parseCell(cell) {
  const match = cell.match(/^([A-Z]+)(\d+)$/i);
  if (!match) throw new Error('Invalid cell reference');

  const colLetters = match[1].toUpperCase();
  const rowNumber = parseInt(match[2], 10);

  // Convert letters to column number (A=1, B=2, ..., Z=26, AA=27, etc.)
  let colNumber = 0;
  for (let i = 0; i < colLetters.length; i++) {
    colNumber = colNumber * 26 + (colLetters.charCodeAt(i) - 64);
  }

  return [colNumber, rowNumber];
}

module.exports = router;
