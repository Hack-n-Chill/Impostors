const http=require('http');
const path=require('path');

const bodyParser=require('body-parser');
const express=require('express');
const app=express();
const mongoose=require('mongoose');


app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/coviddb",{useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false});

const hospitalSchema = new mongoose.Schema({
    name: String,
    email: String,
    coordinates: {
        lat: Number,
        long: Number
    }
  });

const hospital=mongoose.model("Hospital",hospitalSchema);

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/admin/hospital',(req,res)=>{
    res.render('adminpage');
});

app.get('/new-user/patient',(req,res)=>{
    res.render('patient_registration');
});

app.post('/admin/hospital',(req,res)=>{
    console.log(req.body.longi);
    // if (req.body.lati!=0&&req.body.longi!=0)
    // {
    const newho=new hospital({
        name: req.body.nameOfHospital,
        email: req.body.hospitalemail,
        coordinates: {
            lat: req.body.lati,
            long: req.body.longi
        }
    });
    newho.save();
    console.log('success');
//  }
    
    // res.redirect('/');
})

app.listen(3000,function() {
    console.log("server running on port 3000");
});