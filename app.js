const http=require('http');
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
require('dotenv').config();


app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

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
    email: String,
    password: String,
    googleId: String,
    secret: String
  });

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

const hospitalSchema = new mongoose.Schema({
    name: String,
    email: String,
    coordinates: {
        lat: Number,
        long: Number
    }
  });

const hospital=mongoose.model("Hospital",hospitalSchema);



passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/success",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
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

app.get('/admin/hospital',(req,res)=>{
    res.render('adminpage');
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