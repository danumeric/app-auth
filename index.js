require('dotenv').config()
const jwt = require('jsonwebtoken')
const { secretKey } = require('./config')
const express = require('express')
const mongoose = require('mongoose')
const mainRouter = require('./mainRouter')
const cors = require('cors')
const Messages = require('./models/Messages')
let vaultIdSocketIo = {};
const socketIO = require('socket.io');

const corsOptions = {
  origin: '*',
  credentials: true
}
const PORT = process.env.PORT || 5000;

const app = express().use(cors(corsOptions)).use('/auth', mainRouter).use(express.json()).listen(PORT, () => console.log(`server started at ${PORT}`));

const io = socketIO(app);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
  } catch (e) {
    console.log(e);
  }
};

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

io.on('connection', (socket) => {
  try {
    console.log('a user connected');

  } catch (e) {
    console.log(e);
  }

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('messageToServer', async (inp, callback) => { // from client to server
    try {
      const decodedData = jwt.verify(inp.token, secretKey);
      let msgToClient = inp;
      msgToClient.senderID = decodedData.id
      delete msgToClient.token;
      if (vaultIdSocketIo[inp.target]) {//if client2 online, send via socketIO immediatly
        io.to(vaultIdSocketIo[msgToClient.target]).emit("messageFromServer", msgToClient);
      }

      await Messages.updateOne(//add to sender messages DB

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

      await Messages.updateOne(//add to recipient messages DB

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

    callback({//for client that message is deliveried to server and successfully added to mongoDB
      idDelivMsg: inp.idMongo
    });

  });
});

