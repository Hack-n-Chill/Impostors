const https=require('https');
const path=require('path');

const bodyParser=require('body-parser');
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const { json } = require('body-parser');
require('dotenv').config();


app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));
app.use(json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/coviddb",{useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
    name: String,
    email: String,
    googleId: String,
    role: String
  });

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


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

let userid;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/success",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    userid=profile.displayName;
    User.findOrCreate({ googleId: profile.id,name: profile.displayName }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/',(req,res)=>{
    res.render('index');
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get('/auth/google/success', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.render('front_page',{
      name: userid
    })
  });

app.get('/admin/hospital',(req,res)=>{
    res.render('adminpage',{
      step1: "active",
      step2: "",
      prevbut: "disabled",
      form1: "",
      form2: "hidden",
      nameOfHospital: ""
    });
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get('/new-user/patient',(req,res)=>{
    res.render('patient_registration');
});
let tempemail,tempname;
app.post('/admin/hospital',(req,res)=>{
    
    tempemail=req.body.hospitalemail;
    tempname=req.body.nameOfHospital;
    res.render('adminpage',{
      step1: "",
      step2: "active",
      prevbut: "",
      form1: "hidden",
      form2: "",
      nameOfHospital: tempname
    });

});
let addr,longt,latt;
app.post('/admin/hospital/location',(req,res)=>{
  console.log(req.body);
  console.log(req.body.lati);
  longt=req.body.longi;
  latt=req.body.lati;
  let addressfind="https://revgeocode.search.hereapi.com/v1/revgeocode?apikey="+process.env.MAP_APIKEY+"&at="+req.body.lati+","+req.body.longi+"&lang=en-US";
  https.get(addressfind,resp=>{
    let body = "";

    resp.on("data", (chunk) => {
        body += chunk;
    });

    resp.on("end", () => {
        try {
            let json = JSON.parse(body);
            // do something with JSON
            addr = json.items[0].title;
            res.send(addr);
        } catch (error) {
            console.error(error.message);
        };
    });
  });
  // 
});

app.post('/admin/hospital/:action',(req,res)=>{
  let act=req.params.action;
  if(act=='save') {
    const dat=new hospital({
      name: tempname,
      email: tempemail,
      coordinates: {
        lat: latt,
        long: longt
      },
      address: addr
    });
    res.render('successhospital',{
      name: tempname,
      email: tempemail
    });
    dat.save();
    
  } else if (act=='reject') {
    res.render('adminpage',{
      step1: "",
      step2: "active",
      prevbut: "",
      form1: "hidden",
      form2: "",
      nameOfHospital: tempname
    });
  }
})

app.listen(3000,function() {
    console.log("server running on port 3000");
});