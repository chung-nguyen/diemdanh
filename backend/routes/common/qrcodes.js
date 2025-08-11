const { DEFAULT_SETTINGS } = require('../../config');

exports.getQRCodeLink = function (attendance) {
  const guestId = typeof (attendance.guestId) === 'string' ? attendance.guestId : attendance.guestId._id;
  const checkInURL = DEFAULT_SETTINGS.checkInURL + '/' + Buffer.from(String(guestId)).toString('base64') + '/' + Buffer.from(String(attendance._id)).toString('base64');
  return checkInURL;
}
