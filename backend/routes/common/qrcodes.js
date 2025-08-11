const { DEFAULT_SETTINGS } = require('../../config');

exports.getQRCodeLink = function (attendance) {
  const idNumber = attendance.guestId.idNumber;
  const checkInURL = DEFAULT_SETTINGS.checkInURL + '/' + Buffer.from(String(idNumber)).toString('base64') + '/' + Buffer.from(String(attendance._id)).toString('base64');
  return checkInURL;
}
