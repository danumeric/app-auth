const jwt = require('jsonwebtoken')
const { secretKey } = require('../config')


module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization;
    //const token = req.headers.authorization:.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'no token' })
    }
    const decodedData = jwt.verify(token, secretKey);
    req.userId = decodedData.id  //для дальнейшего использования по цепочке 
    next();
  } catch (e) {
    console.log(e);
    return res.status(403).json({ failedAuth: true, message: 'Пользователь не авторизован (middleware)' })
  }
}