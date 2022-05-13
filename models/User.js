const { Schema, model } = require('mongoose')

const User = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  secondName: { type: String, required: true },
  sex: { type: String, required: true },
  birthDate: { type: String, required: true },
  country: { type: String, required: true },
  selectedAvatar: { type: String, required: true },//link
  friends: { type: Array },
  roles: [{ type: String, ref: 'Role' }]
})

module.exports = model('User', User)