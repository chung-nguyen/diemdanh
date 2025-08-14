var express = require('express');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var logger = require('../logger');

const { verifyAuthorization } = require('../utils/auth-utils');
const { Attendance, Admin, Meeting } = require('../models');
const { AttendanceStatus } = require('../models/attendance');

var router = express.Router();

function jwtSign(payload, secret, expiresIn) {
  return new Promise(function (resolve, reject) {
    jwt.sign(payload, secret, { expiresIn }, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

router.get('/home', async function (req, res, next) {
  res.render('index');
});

router.get('/dd/login', async function (req, res, next) {
  res.render('login', { code: 'X' });
});

router.post('/dd/login/:code', async function (req, res, next) {
  const { code } = req.params;

  const { username, password } = req.body;
  console.log(username, password);

  let me = await Admin.findById(username);
  if (!me) {
    res.render('login', { code, error: 'Đăng nhập thất bại' });
    return;
  }

  if (me.password !== password) {
    res.render('login', { code, error: 'Đăng nhập thất bại' });
    return;
  }

  const accessPayload = {
    id: me._id,
    username: me._id,
    role: me.role,
  };

  const tokenSalt = process.env.WEB_TOKEN_SALT || 'salt';
  const mid = Math.floor(tokenSalt.length / 2);
  const accessToken = await jwtSign(accessPayload, tokenSalt.slice(0, mid), '1d');

  res.cookie('authorization', `Bearer ${accessToken}`);
  res.redirect(`/dd/${code}`);
});

router.get('/dd/confirm/:code', async function (req, res, next) {
  const { code } = req.params;

  const cookies = req.cookies || {};
  try {
    const tokenSalt = process.env.WEB_TOKEN_SALT || 'salt';
    const mid = Math.floor(tokenSalt.length / 2);
    await verifyAuthorization(cookies.authorization, tokenSalt.slice(0, mid));

    try {
      const attendanceId = Buffer.from(code, 'base64').toString('ascii');

      const attendance = await Attendance.findById(attendanceId).populate('guestId meetingId');
      if (attendance) {
        const guest = attendance.guestId;
        const meeting = attendance.meetingId;

        if (attendance.status !== AttendanceStatus.CHECKED_IN) {
          attendance.status = AttendanceStatus.CHECKED_IN;
          attendance.checkInTime = new Date();
          await attendance.save();
        }
      }
    } catch (ex) {
      console.error(ex);
    }
  } catch (ex) {
    console.error(ex);
  }

  res.redirect(`/dd/${code}`);
});

router.get('/dd/:code', async function (req, res, next) {
  const { code } = req.params;
  const apiKey = req.query.api;
  const cookies = req.cookies || {};

  if (code === 'X') {
    res.render('attendance', { error: 'Đã login vào hệ thống' });
    return;
  }

  try {
    // if (apiKey !== process.env.API_KEY) {
    //   const tokenSalt = process.env.WEB_TOKEN_SALT || 'salt';
    //   const mid = Math.floor(tokenSalt.length / 2);
    //   await verifyAuthorization(cookies.authorization, tokenSalt.slice(0, mid));
    // }

    try {
      const attendanceId = Buffer.from(code, 'base64').toString('ascii');

      const attendance = await Attendance.findById(attendanceId).populate('guestId meetingId');
      if (attendance) {
        const guest = attendance.guestId;
        const meeting = attendance.meetingId;

        if (attendance.status !== AttendanceStatus.CHECKED_IN) {
          attendance.status = AttendanceStatus.CHECKED_IN;
          attendance.checkInTime = new Date();
          await attendance.save();
          logger.info(`[check-in] ${guest.idNumber} attended at ${meeting._id} at time ${attendance.checkInTime.toString()}`);
        } else {
          logger.warn(`[check-in] ${guest.idNumber} redo at ${meeting._id} at time ${attendance.checkInTime.toString()}`);
        }
      }
    } catch (ex) {
      console.error(ex);
    }
  } catch (ex) {
    console.error(ex);
  }

  try {
    // if (apiKey !== process.env.API_KEY) {
    //   const tokenSalt = process.env.WEB_TOKEN_SALT || 'salt';
    //   const mid = Math.floor(tokenSalt.length / 2);
    //   await verifyAuthorization(cookies.authorization, tokenSalt.slice(0, mid));
    // }

    try {
      const attendanceId = Buffer.from(code, 'base64').toString('ascii');

      const attendance = await Attendance.findById(attendanceId).populate('guestId meetingId');
      if (attendance) {
        const guest = attendance.guestId;
        const meeting = attendance.meetingId;

        // if (attendance.status !== AttendanceStatus.CHECKED_IN) {
        //   attendance.status = AttendanceStatus.CHECKED_IN;
        //   attendance.checkInTime = new Date();
        //   await attendance.save();
        // }

        const guestImageURL = `/photo/${guest.idNumber}.jpg`;

        res.render('attendance', {
          code,
          guestImageURL,
          attendTime: moment(attendance.checkInTime).format('hh:mm DD/MM/YYYY'),
          guestName: guest.fullName,
          guestID: guest.idNumber,
          guestEmail: guest.email,
          meetingName: meeting.name,
          guestOffice: guest.office,
          guestWorkplace: guest.workplace,
          guestPhoneNumber: guest.phoneNumber,
          guestEmail: guest.email,
          isCheckedIn: attendance.status === AttendanceStatus.CHECKED_IN,
        });
      } else {
        res.render('attendance', { error: 'Mã QR không hợp lệ' });
      }
    } catch (ex) {
      console.error(ex);
      res.render('attendance', { error: 'Mã QR không hợp lệ' });
    }
  } catch (ex) {
    console.error(ex);
    res.render('login', { code });
  }
});

router.get('/seatmap/:meeting', async function (req, res, next) {
  const meetingId = req.params.meeting;
  
  const meeting = await Meeting.findById(meetingId).populate('seatmapId').lean();
  const seatmap = meeting.seatmapId;

  const attendances = await Attendance.find({ meetingId }).populate('guestId').lean();

  const sheet = [];
  const { startCol, startRow, endCol, endRow, seats } = seatmap;
  for (let r = startRow; r <= endRow; ++r) {
    const row = [];
    for (let c = startCol; c <= endCol; ++c) {
      const value = seats[`${r}:${c}`];
      let attended = false;

      const attendance = attendances.find((it) => it.guestId.idNumber == value);
      if (attendance && attendance.status === AttendanceStatus.CHECKED_IN) {
        attended = true;
      }
      row.push(value ? { value, attended } : null); 
    }
    sheet.push(row);
  }

  res.render('seatmap', { sheet });
});

router.get('/sample', async function (req, res, next) {
  res.render('attendance', {
    code: 'XXX',
    guestImageURL: 'xxx',
    attendTime: '123',
    guestName: 'ABC',
    guestID: '123',
    guestEmail: '123',
    meetingName: '123',
    guestOffice: 'Bí thư Đảng bộ các cơ quan Đảng, Phó Bí thư Thường trực Đảng ủy phường',
    guestWorkplace: '123',
    guestPhoneNumber: '123',
    guestEmail: '123',
    isCheckedIn: true
  });
});

router.get('/fc', async function (req, res, next) {
  res.render('capture', {});
});

module.exports = router;
