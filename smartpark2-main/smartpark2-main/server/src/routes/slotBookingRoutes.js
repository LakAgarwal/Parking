const express = require('express');
const router = express.Router();
const {
  createSlotBooking,
  getSlotBooking,
  updateSlotBooking,
  deleteSlotBooking,
  getQrDetailsByDataFromBody,
  getSlotBookingsForUserOnDate,
  validateData
} = require('../controllers/slotBookingControllers');

// Create a new slot booking
router.post('/', createSlotBooking);

// Get a slot booking by ID
router.get('/:id', getSlotBooking);

// Update a slot booking by ID
router.put('/:id', updateSlotBooking); 

// Delete a slot booking by ID
router.delete('/:id', deleteSlotBooking);

router.post('/details', getQrDetailsByDataFromBody);

router.get('/slotbookings/:user_id/:date', getSlotBookingsForUserOnDate);

router.post('/validate-qr',validateData)

module.exports = router;
