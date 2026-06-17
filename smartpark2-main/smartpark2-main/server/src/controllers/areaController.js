const { AreaModel } = require('../models'); 

exports.getAllAreas = async (req, res) => {
  console.log({
    AreaModel
  })
  try {
    const areas = await AreaModel.find({});
    return res.status(200).send({
      areaCount: areas.length,
      success: true,
      message: "All areas data",
      areas,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error in getting all areas",
      success: false,
      error: err,
    });
  }
};



exports.createArea = async (req,res) => {
  try {
    const files = req.files;
    if (files) {
      const imagePath = files?.imagePath[0]?.path
      if (imagePath) {
        req.body.imagePath = imagePath;
      }
    }

    const newArea = await ParkingAreaModel.create({...req.body});
    res.status(201).send({
      success: true,
      message: "New Area Created",
      area: newArea,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error in creating area",
      success: false,
      error: err, 
    });
  }
};



exports.getSingleArea = async (req, res) => {
  try {
    const area = await AreaModel.findById(req.params.id);
    if (!area) {
      return res.status(404).send({
        message: "Area not found",
        success: false,
      });
    }
    res.send({
      success: true,
      message: "Area found",
      area,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error in getting area",
      success: false,
      error: err,
    });
  }
};



exports.editArea = async (req, res) => {
  try {
    const area = await AreaModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!area) {
      return res.status(404).send({
        message: "Area not found",
        success: false,
      });
    }
    res.send({
      success: true,
      message: "Area updated",
      area,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error in editing area",
      success: false,
      error: err,
    });
  }
};



exports.deleteArea = async (req, res) => {
  try {
    const area = await AreaModel.findByIdAndDelete(req.params.id);
    if (!area) {
      return res.status(404).send({
        message: "Area not found",
        success: false,
      });
    }
    res.send({
      success: true,
      message: "Area deleted",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error in deleting area",
      success: false,
      error: err,
    });
  }
};


