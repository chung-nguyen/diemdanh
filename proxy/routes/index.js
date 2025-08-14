var express = require('express');
var url = require('url');

var router = express.Router();

const { exec } = require('child_process');

/* GET home page. */
router.get('/qr/:code', function(req, res, next) {
  const { code } = req.params;
  console.log(process.env.CHECKIN_URL)
  const checkinURL = url.resolve(process.env.CHECKIN_URL, code) + `?api=${process.env.API_KEY}`;
  exec(`start msedge --app="${checkinURL}"`);

  res.send(code);
});

module.exports = router;
