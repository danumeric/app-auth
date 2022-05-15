const Router = require('express')
const bodyParser = require('body-parser')
const router = new Router();
const authContr = require('./controllers/authController')
const messagesContr = require('./controllers/messagesController')
const cors = require('cors')
let corsOptions = {
  origin: '*',
  credentials: true
}
const jsonParser = bodyParser.json()
const authMiddleware = require('./middlewares/authMiddleware')

const roleMiddleware = require('./middlewares/roleMiddleware')
const { check } = require('express-validator')

router.post('/registration', [
  jsonParser,
  check('username', 'Имя пользователя не может быть пустым').notEmpty(),
  check('password', 'от 4 до 10 симв').isLength({ min: 4, max: 10 })
], authContr.registration)
router.post('/login', [jsonParser], authContr.login)
router.get('/users', jsonParser, authMiddleware, authContr.getUsers)
router.get('/messages', jsonParser, authMiddleware, messagesContr.getMessages)
router.post('/addConversation', cors(corsOptions), jsonParser, authMiddleware, messagesContr.addConversation)

// controller.createTestMessage, 
module.exports = router