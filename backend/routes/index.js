var express = require('express');
var jwt = require('jsonwebtoken');
var moment = require('moment');

const { verifyAuthorization } = require('../utils/auth-utils');
const { Attendance, Admin } = require('../models');
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

router.get('/', async function (req, res, next) {
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

  if (code === 'X') {
    res.render('attendance', { error: 'Đã login vào hệ thống' });
    return;
  }

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

module.exports = router;
