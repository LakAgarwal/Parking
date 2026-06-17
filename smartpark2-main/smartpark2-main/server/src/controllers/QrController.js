const {QrModel,slotBooking} = require('../models');


// Create a new QR code
exports.createQrCode = async (data) => {
    const newQrCode = await QrModel.create(data);
    return newQrCode
}; 

// Get a QR code by ID
exports.getQrCode = async (req, res) => {
  try {
    const qrCode = await QrModel.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    return res.json(qrCode);
  } catch (error) {
    return res.status(500).json({ error: 'Could not get QR code' });
  }
};


exports.getUserQrCodes = async(req,res)=>{
  try{
    const user_id = req.params.user_id;
    console.log(user_id);
    return res.json(await QrModel.find({user_id})); 
  }
  catch (error) {
    return res.status(500).json({ error: 'Could not get QR code' });
  }
}
// Update a QR code by ID
exports.updateQrCode = async (req, res) => {
  try {
    const updatedQrCode = await QrModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedQrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    return res.json(updatedQrCode);
  } catch (error) {
    return res.status(500).json({ error: 'Could not update QR code' });
  }
};

// Delete a QR code by ID
exports.deleteQrCode = async (req, res) => {
  try {
    const deletedQrCode = await QrModel.findByIdAndRemove(req.params.id);
    if (!deletedQrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    return res.json({ message: 'QR code deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Could not delete QR code' });
  }
};


// Define your controller function to get slot booking details and path by QR ID
exports.getSlotBookingDetailsByQrId = async (req, res) => {

  try {
    // Extract qr_id from request parameters
    const { qr_id } = req.params;
    // console.log(qr_id)

    // Find the slot booking associated with the QR ID
    const bookingData = await slotBooking.findOne({Qr_id: `${qr_id}`});
    console.log({bookingData})
    
    if (!bookingData) {
      return res.status(404).json({ error: 'Slot booking not found for the QR ID' });
    }
    
    // Find the path associated with the QR ID
    const qrPath = await QrModel.findOne({ user_id: bookingData.user_id }); // Assuming user_id is used to link QR to slot booking
    console.log(qrPath)

    if (!qrPath) {
      return res.status(404).json({ error: 'QR path not found for the QR ID' });
    }

    // Return the slot booking details and path
    return res.status(200).json({ slotBooking, qrPath });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Could not get slot booking details and path' });
  }
};
