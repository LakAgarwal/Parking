const mongoose = require('mongoose');

const slotBookingSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: [true, 'user_id is required']
  },
  Qr_id: {
    type: String,
    // required: [true, 'Qr_id isnt required']
  },
  area_id: {
    type: String,
    required: [true, 'area_id is required']
  },
  expiryAt: {
    type: String,
    required: [true, 'expiryAt is required']
  },
  entry_time: {
    type: Number,
    required: [false, 'entry_time isnt required']
  },
  exit_time: {
    type: Number,
    required: [false, 'exit_time isnt required']
  },
  area_id:{
    type: String
  }
}, { timestamps: true });

const SlotBooking = mongoose.model('SlotBooking', slotBookingSchema);

module.exports = SlotBooking;
