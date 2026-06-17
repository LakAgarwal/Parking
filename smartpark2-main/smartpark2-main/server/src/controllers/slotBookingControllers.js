const {slotBooking} = require('../models');
const { QRGenerator } = require('../shared/QRGenerator')
const {v4 : uuidv4} = require('uuid')
const QrModel = require('../models');

// Create a new slot booking
exports.createSlotBooking = async (req, res) => {
  console.log("createSlotBooking method called")
  try {
    const data = req.body
    const newId = uuidv4()
    const qrCodeData = {...data, serial_no: newId}
    const qrCode = await QRGenerator(qrCodeData)
    const slotBookingData = {
      ...data,
      Qr_id: qrCode._id,
      expiryAt: Date.now() + 10 * 60 * 1000,
    }
    const newSlotBooking = await slotBooking.create(slotBookingData);
    return res.status(201).json({newSlotBooking, qrCodeSrc: qrCode.path});
  } catch (error) {
    return res.status(500).json({ error: 'Could not create slot booking' }); 
  }
};

// Get a slot booking by ID
exports.getSlotBooking = async (req, res) => {
  try {
    const bookingData = await slotBooking.findById(req.params.id);
    if (!bookingData) {
      return res.status(404).json({ error: 'Slot booking not found' });
    } 
    return res.json(bookingData);
  } catch (error) {
    return res.status(500).json({ error: 'Could not get slot booking' });
  }
};

// Update a slot booking by ID
exports.updateSlotBooking = async (req, res) => {
  try {
    const updatedSlotBooking = await slotBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSlotBooking) {
      return res.status(404).json({ error: 'Slot booking not found' });
    }
    return res.json(updatedSlotBooking);
  } catch (error) {
    return res.status(500).json({ error: 'Could not update slot booking' });
  }
};

// Delete a slot booking by ID
exports.deleteSlotBooking = async (req, res) => {
  try {
    const deletedSlotBooking = await slotBooking.findByIdAndRemove(
      req.params.id
    );
    if (!deletedSlotBooking) {
      return res.status(404).json({ error: 'Slot booking not found' });
    }
    return res.json({ message: 'Slot booking deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Could not delete slot booking' });
  }
};


exports.getQrDetailsByDataFromBody = async (req, res) => {
  try {
    // Retrieve data from the request body
    const { serial_no } = req.body;

    // Use the data to query the QR code
    const qrDetails = await QrModel.findOne({ serial_no });

    if (!qrDetails) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    return res.status(200).json(qrDetails);
  } catch (error) {
    return res.status(500).json({ error: 'Could not get QR code details' });
  }
};

exports.getSlotBookingsForUserOnDate = async (req, res) => {
  try {
    // Extract user_id and date from request parameters
    const { user_id, date } = req.params;
    console.log({user_id, date})

    // Calculate the start and end of the day based on the date
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    console.log({startOfDay, endOfDay})

    // Find slot bookings for the specified user on the specified day
    const bookings = await slotBooking.find({
      user_id,
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });
    console.log({bookings})

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ error: 'Could not get slot bookings' });
  }
};


exports.validateData = async (req, res) => {
  try {
    const { serial_no } = req.body;
    const qrDetails = await QrModel.findOne({ serial_no });
    const slotBooking = await slotBooking.find({Qr_id: qrDetails._id});
    if(slotBooking.entry_time){
      const updatedSlotBooking = await slotBooking.findByIdAndUpdate(
        req.slotBooking._id,
        {
          exit_time:new Date(),

        },
        { new: true }
      );
    }
    else{
      const updatedSlotBooking = await slotBooking.findByIdAndUpdate(
        req.slotBooking._id,
        {
          entry_time:new Date(),

        },
        { new: true }
      );
    }
    return res.json(validateData);
  } catch (error) {
    return res.status(500).json({ error: 'Could not update slot booking' });
  }
};