const http=require('http');
const path=require('path');

const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const express=require('express');

const app=express();

app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/coviddb",{useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false});

const hospitalSchema = new mongoose.Schema({
    name: String,
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  });

const hospital=mongoose.model("Hospital",hospitalSchema);

app.get('/',(req,res)=>{
    res.render('');
});

app.get('/admin/hospital',(req,res)=>{
    res.render('adminpage');
});


app.listen(3000,function() {
    console.log("server running on port 3000");
});