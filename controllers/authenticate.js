const mongoose=require('mongoose');
const {hospital, Patient}=require('../models/mongoschemas');

exports.basicauth=(req,res,next) =>{
    if(req.user==null)
    return res.redirect('/')
    var aik=false;
    Patient.findOne({email: req.user.email},(err,patient)=>{
        if(patient) {
            aik=true;}
    });
    if(aik==true)
    return res.redirect('/loggedinuser/patient');
    next();
};

