require('dotenv').config()
const jwt = require('jsonwebtoken')
const { secretKey } = require('./config')
const express = require('express')
const mongoose = require('mongoose')
const mainRouter = require('./mainRouter')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const appSocket = express()
const { createServer } = require("http");
const { createCipheriv } = require('crypto')
const Messages = require('./models/Messages')
let vaultIdSocketIo = {};
const socketIO = require('socket.io');



// const io = new Server(httpServer, {
//   cors: {
//     origin: '*',
//     allowUpgrades: true,
//     transports: ['polling', 'websocket'],
//     pingTimeout: 9000,
//     pingInterval: 3000,
//     cookie: 'mycookie',
//     httpCompression: true,
//   },

// });


const PORT = process.env.PORT || 5000;


const app = express().use(cors({
  origin: '*',
  methods: "GET,PUT,POST,DELETE",
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
})).use('/auth', mainRouter).use(express.json()).listen(PORT, () => console.log(`server started at ${PORT}`));

const io = socketIO(app);




const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
  } catch (e) {
    console.log(e);
  }
}
start();
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      next(new Error("no token"))
    }
    const decodedData = jwt.verify(token, secretKey);
    vaultIdSocketIo[decodedData.id] = socket.id;
    next();
  } catch (e) {
    console.log(e);
    next(e);
  }
});

//httpServer.listen(3000);
io.on('connection', (socket) => {
  try {
    console.log('a user connected');

  } catch (e) { console.log(e); }

  socket.on('disconnect', () => { //TODO удалять из vaultIdSocketIo неактуальные socketioID
    console.log('user disconnected');
  });


  socket.on('messageToServer', async (inp, callback) => {
    try {
      const decodedData = jwt.verify(inp.token, secretKey);
      let msgToClient = inp;
      msgToClient.senderID = decodedData.id
      delete msgToClient.token;
      if (vaultIdSocketIo[inp.target]) {//отправка юзеру, если есть в таблице. вместо токена отпр ID отправителя
        io.to(vaultIdSocketIo[msgToClient.target]).emit("messageFromServer", msgToClient);
        //io.emit("messageFromServer", inp);
      }

      await Messages.updateOne(//запись дб отправителя

        {
          "ownerId": decodedData.id,
          "messages.idInterlocator": inp.target
        },

        {
          $push: {
            "messages.$.conversations": {
              fromOwner: true,
              timeStamp: inp.timeStamp,
              message: inp.message,
              _id: inp.idMongo
            }
          }
        }
      );

      await Messages.updateOne(//запись дб получателя

        {
          "ownerId": inp.target,
          "messages.idInterlocator": decodedData.id,
        },

        {
          $push: {
            "messages.$.conversations": {
              fromOwner: false,
              timeStamp: inp.timeStamp,
              message: inp.message,
              _id: inp.idMongo
            }
          }
        }
      );
    } catch (e) {
      console.log(e);
    }

    callback({
      idDelivMsg: inp.idMongo
    });

  });
});

