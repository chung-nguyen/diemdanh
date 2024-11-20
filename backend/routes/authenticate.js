var express = require('express');
var jwt = require('jsonwebtoken');

var { Admin } = require('../models');

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

function jwtVerify(token, secret) {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, secret, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

router.post('/', async function (req, res, next) {
  const { username, password } = req.body;

  const me = await Admin.findById(username);

  if (!me) {
    return res.status(404).json({
      accessToken: undefined,
      me: undefined,
      role: undefined,
      status: 'error',
      reason: 'account',
    });
  }

  if (me.password !== password) {
    return res.status(403).json({
      accessToken: undefined,
      me: undefined,
      role: undefined,
      status: 'error',
      reason: 'account',
    });
  }

  me.password = '';

  const accessPayload = {
    id: me._id,
    username: me._id,
    role: me.role,
  };

  const tokenSalt = process.env.WEB_TOKEN_SALT || 'salt';
  const mid = Math.floor(tokenSalt.length / 2);
  const accessToken = await jwtSign(accessPayload, tokenSalt.slice(0, mid), '1d');
  const refreshToken = await jwtSign(accessPayload, tokenSalt.slice(mid, tokenSalt.length), '180d');

  res.status(200).json({
    me,
    accessToken,
    refreshToken,
    role: me.role,
    status: 'ok',
    reason: undefined,
  });
});

router.get('/', async function (req, res, next) {
  const { authorization } = req.headers;
  const [_, accessToken] = authorization?.split(' ') || [];

  const tokenSalt = process.env.WEB_TOKEN_SALT || 'salt';
  const mid = Math.floor(tokenSalt.length / 2);
  const accessPayload = await jwtVerify(accessToken, tokenSalt.slice(0, mid));

  let me = await Admin.findById(accessPayload.id);

  if (!me) {
    return res.status(404).json({ message: 'No such user' });
  }

  res.status(200).json({ me });
});

router.post('/refresh', async function (req, res, next) {
  const { token } = req.body;

  const tokenSalt = process.env.WEB_TOKEN_SALT || 'salt';
  const mid = Math.floor(tokenSalt.length / 2);
  const accessPayload = await jwtVerify(token, tokenSalt.slice(mid, tokenSalt.length));

  const accessToken = await jwtSign(accessPayload, tokenSalt.slice(0, mid), '1d');
  res.status(200).send({ accessToken });
});

module.exports = router;
