const mongoose=require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: String,
    email: String,
    coordinates: {
        lat: Number,
        long: Number
    },
    address: String
  });

const hospital=mongoose.model("Hospital",hospitalSchema);

const patientSchema = new mongoose.Schema ({
  email: {type: String, unique: true},
  stage: Number,
  drname: String,
  hospname: String,
  coordinates: {
    lat: Number,
    long: Number
},
address: String
});


const Patient= new mongoose.model("Patient", patientSchema);

module.exports={hospital, Patient};