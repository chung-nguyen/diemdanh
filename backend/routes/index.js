var express = require('express');
const { Attendance } = require('../models');
var router = express.Router();

router.get('/dd/:code', async function(req, res, next) {
  const { code } =  req.params;

  console.log(req.cookies);

  const raw = Buffer.from(code, 'base64').toString('ascii');
  const [meetingId, guestId] = raw.split('|');

  const attendance = await Attendance.findOne({ meetingId, guestId });
  if (!attendance) {
    res.json({ status: 'ok' });
    return;
  }

});

module.exports = router;
