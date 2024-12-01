module.exports = {
  MAX_SUGGESTIONS: 100,
  DEFAULT_SETTINGS: {
    checkInURL: process.env.CHECKIN_URL || 'http://192.168.1.2:5000/dd',
    outputPath: process.env.OUTPUT_PATH || 'c:/temp/out',
    photoPath: process.env.PHOTO_PATH || 'c:/temp/photo',
    uploadPath: process.env.UPLOAD_PATH || 'c:/temp/upload',
    reportPath: process.env.REPORT_PATH || 'c:/temp/report'
  },
};
