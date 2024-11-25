const jwt = require('jsonwebtoken');

exports.verifyAuthorization = (bearer, secret) => {
  return new Promise((resolve, reject) => {
    if (!bearer) {
      reject(new Error('EmptyAuthorizationBearer'));
      return;
    }
    const [_, token] = bearer.split(' ');
    jwt.verify(token, secret, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    })
  });  
}
