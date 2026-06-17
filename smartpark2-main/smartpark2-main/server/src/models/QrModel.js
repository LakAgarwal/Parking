const mongoose = require('mongoose');

const QrModelSchema = new mongoose.Schema({
  path: {
    type: String,
    required: [true, 'user_id is required']
  },
  user_id: {
    type: String,
    required: [true, 'Qr_id is required']
  },
  serial_no: {
    type: String,
    required: [true, 'serial_no is required']
  },
}, { timestamps: true });

const QrModel = mongoose.model('QrModel', QrModelSchema);

module.exports = QrModel;
