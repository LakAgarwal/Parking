const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  areaname: {
    type: String,
    required: [true, 'areaname is required']
  },
  Totalslots: {  
    type: Number,
    required: [true, 'Totalslots is required']
  },
  areaLocation: {
    type: String,
    required: [true, 'areaLocation is required']  
  },
  imagePath: { 
    type: String,
    required: [false, 'Image path is required']
  }
}, { timestamps: true });


const areaModel = mongoose.model('Area', areaSchema);

module.exports = areaModel;
