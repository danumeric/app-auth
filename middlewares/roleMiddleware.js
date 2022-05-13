const jwt = require('jsonwebtoken')
const { secretKey } = require('../config')


module.exports = function (roles) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }
    try {
      console.log(req.headers);
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(403).json({ message: 'no token' })
      }
      const { 'roles': userRoles } = jwt.verify(token, secretKey);// в токен зашит массив ролей
      let hasRole = false;
      userRoles.forEach(element => {
        if (roles.includes(element)) {
          hasRole = true;
        }
      });
      if (!hasRole){
        return res.status(403).json({message:'роли нет в массиве, поданного в MW'})
      }
      next();
    } catch (e) {
      console.log(e);
      return res.status(403).json({ message: 'Пользователь не авторизован (middleware)' })
    }
  }
}