
const User = require('../models/User')
const Messages = require('../models/Messages')


class messagesController {

  async getMessages(req, res) {
    try {
      const db = await Messages.findOne({ ownerId: req.userId });
      // console.log(db.messages);//from authMiddleware
      await res.json(db.messages);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: 'getMessages failed', e: e })
    }
  }

  async addConversation(req, res) {
    const idInterlocator = req.body.idInterlocator;
    //console.log(idInterlocator);
    //  console.log(req.userId); // ownerID  в MDB
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
    // const interlocutor = await Messages.findOne({
    //   ownerId: req.userId,
    // //  'messages.idInterlocator': idInterlocator
    // });


    // if (!interlocutor){

    // }
    // console.log(interlocutor);
    // return res.json({ message: interlocutor })
  }
}

module.exports = new messagesController()
