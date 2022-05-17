
const User = require('../models/User')
const Messages = require('../models/Messages')


class messagesController {

  async getMessages(req, res) {
    try {
      const db = await Messages.findOne({ ownerId: req.userId });
      await res.json(db.messages);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: 'getMessages failed', e: e })
    }
  }

  async addConversation(req, res) { //if client1 dont click on client2 before, create fields in DB
    const idInterlocator = req.body.idInterlocator;
    try {
      await Messages.updateOne(
        { ownerId: req.userId },
        {
          $push: {
            messages: {
              idInterlocator: idInterlocator
            }
          }
        }
      );

      await Messages.updateOne(
        {
          ownerId: idInterlocator,
        },
        {
          $push: {
            messages: {
              idInterlocator: req.userId
            }
          }
        }
      );
      const db = await Messages.findOne({ ownerId: req.userId });
      await res.json(db.messages);

    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: "Error addConversation", e: e })
    }
  }
}

module.exports = new messagesController()
