const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: {
    type: String,
    require: true
  },
  lastname: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  birthdate: {
    type: Date,
    require: true
  },
  idnumber: {
    type: String,
    require: true
  },
  city: {
    type: String,
    required: true
  },
  underrents: {
    type: Array,
    required: true
  },
  lastrents : {
    type: Array,
    required: true
  }
}, { titmestamps: true });
const User = mongoose.model('user', userSchema);
module.exports = User;