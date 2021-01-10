const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  cost: {
    type: Number,
    require: true
  },
  cartype: {
    type: String,
    require: true
  },
  fuletype: {
    type: String,
    require: true
  },
  gertype: {
    type: String,
    require: true
  },
  capacity: {
    type: Number,
    require: true
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    required: true
  },
  available: {
    type: Boolean,
    require: true
  }
}, { titmestamps: true });
const Car = mongoose.model('car', carSchema);
module.exports = Car;