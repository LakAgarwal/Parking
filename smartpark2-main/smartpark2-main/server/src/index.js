const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors')
const morgan=require('morgan')
const connectDB = require('./config/db') 
const path = require("path");
const multer = require("multer");

app.use(express.json());
app.use(cors())
app.use(morgan('dev'))
app.use(express.static('public'));

const userRoutes = require('./routes/userRoutes');
const areaRoutes = require('./routes/areaRoutes');
const QrRoutes = require('./routes/QrRoutes');
const slotBookingRoutes = require('./routes/slotBookingRoutes');

connectDB(); 

app.use('/api/v1/user',userRoutes);
app.use('/api/v1/area',areaRoutes);
app.use('/api/v1/qr',QrRoutes);
app.use('/api/v1/slotbooking',slotBookingRoutes);


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where uploaded images will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, "image-" + uniqueSuffix + fileExtension);
  },
});
const upload = multer({ storage: storage });



const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
});
