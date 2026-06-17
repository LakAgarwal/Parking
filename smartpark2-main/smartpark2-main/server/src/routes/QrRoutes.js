const express = require('express');
const router = express.Router();
const {
  // createQrCode,
  getQrCode,
  updateQrCode,
  deleteQrCode,
  getSlotBookingDetailsByQrId,
  getUserQrCodes
} = require('../controllers/QrController');
const validateToken = require('../services/AuthService').validateToken;

// Create a new QR code
// router.post('/', createQrCode); 

router.get('/:user_id', getUserQrCodes);
// Get a QR code by ID
router.get('/:id',validateToken, getQrCode);

// Update a QR code by ID
router.put('/:id', validateToken, updateQrCode);

// Delete a QR code by ID
router.delete('/:id',validateToken, deleteQrCode);

router.get('/details/:qr_id',validateToken, getSlotBookingDetailsByQrId);

module.exports = router; 
