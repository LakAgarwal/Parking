const mongoose = require("mongoose");
const colors = require("colors");


const connectDB = async()=>{
    // console.log(process.env.DB_URL)
  try{
    await mongoose.connect(`${process.env.DB_URL|| "mongodb+srv://shivamuttpal:L95vYXn2s2mOQf9e@parkingsystem.9ssy4nx.mongodb.net/"}`);
    console.log(
      `Connected to Mongodb Database ${mongoose.connection.host}`.bgMagenta.white
    );
  }
  catch(err){
    console.log(`Mil gya error ${err}`.bgRed.white)
  }
};

module.exports = connectDB;  