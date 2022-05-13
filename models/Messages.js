const { Schema, model } = require('mongoose')
const Messages = new Schema({
  ownerId: { type: String, unique: true, required: true },
  messages: [{
    idInterlocator: String,
    conversations: [{
      fromOwner: Boolean,
      timeStamp: String,
      message: String,
    }],
  }]
})

module.exports = model('Messages', Messages)
