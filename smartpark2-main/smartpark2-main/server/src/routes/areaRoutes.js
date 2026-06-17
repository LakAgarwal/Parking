const express = require('express');
const { getAllAreas,getSingleArea,createArea,editArea,deleteArea} = require('../controllers/areaController');
const { processFiles } = require('../shared/Storage')
const validateToken = require('../services/AuthService').validateToken;

const router = express.Router()

//Get ALL Areas || GET
router.get('/areas',getAllAreas);

// Create Area || POST
router.post(
    '/areas',
    processFiles([{ name: 'imagePath' }]), 
    validateToken,
    createArea
);
  
//single area || GET 
router.get('/areas/:id',validateToken,getSingleArea);


// Edit Area || PUT
router.put('/areas/:id',validateToken,editArea);


// Delete Area || DELETE
router.delete('/areas/:id',validateToken,deleteArea);
 

module.exports = router;  