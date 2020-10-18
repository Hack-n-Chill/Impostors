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

const adminroute=require('./controllers/admincallback');
const authenticate=require('./controllers/authenticate');
const regpatient=require('./controllers/patientnew');
let {addr,longt,latt,tempemail,tempname}=require('./models/variables');
const {hospital, Patient}=require('./models/mongoschemas');
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
    googleId: {type: String, unique: true }
  });



userSchema.plugin(passportLocalMongoose,{
  usernameField: "googleId"
});
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

let userid;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/success",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    userid=profile.displayName;
    User.findOrCreate({ googleId: profile.id},{name: profile.displayName,email: profile._json.email}, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/loggedinuser/patient',(req,res)=>{
  res.render('nearby');
})

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile","email"] })
);

app.get('/auth/google/success', 
  passport.authenticate('google', {successRedirect: '/aftersignup',
     failureRedirect: '/' }));

app.get('/admin/hospital',adminroute.gethospregistration);

app.get("/login", function(req, res){
  res.render("login");
});

app.get('/aftersignup',authenticate.basicauth,(req,res)=>{
  res.render('aftersignup',{
    name: req.user.name
  });
})

app.get("/register", function(req, res){
  res.render("register");
});

app.get('/new-user/:role',authenticate.basicauth,(req,res)=>{
    
  tempemail['hos'+req.ip]=req.user.email;
    tempname['hos'+req.ip]=req.user.name;
  if(req.params.role=='patient')
    res.render('patient_registration',{
      name: req.user.name,
      email: req.user.email,
      form2: "hidden"
    });
    else if (req.params.role=='donor')
    res.render('donor-form');
    else if (req.params.role=='doctor')
    res.render('dashboard');
    
});
app.post('/newpatient/location',regpatient.patientlocation);

app.post('/newpatient/location/:option',(req,res)=>{
  if(req.params.option=='save') {
    console.log(latt['hos'+req.ip]);
    User.findOne({email: tempemail['hos'+req.ip]},(err,patient)=>{
      if(patient) {
        const dat=new Patient({
          email: tempemail['hos'+req.ip],
          stage: 1,
          coordinates: {
            lat: latt['hos'+req.ip],
            long: longt['hos'+req.ip]
          },
          address: addr['hos'+req.ip]
        });
        dat.save();
      }
    });
  } else if (req.params.option=='manual') {
    User.findOne({email: tempemail['hos'+req.ip]},(err,patient)=>{
      if(patient) {
        let addresscleaned=req.body.address.replace(/\s/g, '+');
    let citycleaned=req.body.city.replace(/\s/g, '+');
    let countrycleaned=req.body.country.replace(/\s/g, '+');
    let postalcleaned=req.body.postal.replace(/\s/g, '+');
    let addressfind="https://geocode.search.hereapi.com/v1/geocode?apikey="+process.env.MAP_APIKEY+"&q="+addresscleaned+"%2C"+postalcleaned+"%2C"+citycleaned+"%2C"+countrycleaned+"&lang=en-US";
    https.get(addressfind,resp=>{
      let body = "";
  
      resp.on("data", (chunk) => {
          body += chunk;
      });
  
      resp.on("end", () => {
          try {
              let json = JSON.parse(body);
              // do something with JSON
              const dat=new Patient({
                email: tempemail['hos'+req.ip],
                stage: 1,
                coordinates: {
                  lat: json.items[0].position.lat,
                  long: json.items[0].position.lng
                },
                address: json.items[0].title
              });
              dat.save();
          } catch (error) {
              console.error(error.message);
          };
      });
    });
      }
    });
  }
  res.render('nearby');
});
app.post('/admin/hospital',adminroute.posthospregistration);

app.post('/admin/hospital/location',adminroute.posthosplocation);

app.post('/admin/hospital/manual',adminroute.posthosplocmanual);

app.post('/admin/hospital/:action',adminroute.posthosplocchoice);

app.use('/',(req,res)=>{
  res.render('404');
})

app.listen(3000,function() {
    console.log("server running on port 3000");
});
