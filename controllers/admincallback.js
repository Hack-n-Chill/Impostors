const https=require('https');

let {addr,longt,latt,tempemail,tempname}=require('../models/variables');
const {hospital}=require('../models/mongoschemas');

exports.gethospregistration=(req,res)=>{
    res.render('adminpage',{
      step1: "active",
      step2: "",
      prevbut: "disabled",
      form1: "",
      form2: "hidden",
      nameOfHospital: ""
    });
};

exports.posthospregistration=(req,res)=>{
    
    tempemail['hos'+req.ip]=req.body.hospitalemail;
    tempname['hos'+req.ip]=req.body.nameOfHospital;
    res.render('adminpage',{
      step1: "",
      step2: "active",
      prevbut: "",
      form1: "hidden",
      form2: "",
      nameOfHospital: tempname['hos'+req.ip]
    });

};

exports.posthosplocation=(req,res)=>{
    console.log(req.body);
    console.log(req.body.lati);
    longt['hos'+req.ip]=req.body.longi;
    latt['hos'+req.ip]=req.body.lati;
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
              addr['hos'+req.ip] = json.items[0].title;
              res.send(addr['hos'+req.ip]);
          } catch (error) {
              console.error(error.message);
          };
      });
    });
    // 
  };

  exports.posthosplocmanual=(req,res)=>{
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
              const dat=new hospital({
                name: tempname['hos'+req.ip],
                email: tempemail['hos'+req.ip],
                coordinates: {
                  lat: json.items[0].position.lat,
                  long: json.items[0].position.lng
                },
                address: json.items[0].title
              });
              dat.save();
              res.render('successhospital',{
                name: tempname['hos'+req.ip],
                email: tempemail['hos'+req.ip]
              });
          } catch (error) {
              console.error(error.message);
          };
      });
    });
  };

  exports.posthosplocchoice=(req,res)=>{
    let act=req.params.action;
    if(act=='save') {
      const dat=new hospital({
        name: tempname['hos'+req.ip],
        email: tempemail['hos'+req.ip],
        coordinates: {
          lat: latt['hos'+req.ip],
          long: longt['hos'+req.ip]
        },
        address: addr['hos'+req.ip]
      });
      res.render('successhospital',{
        name: tempname['hos'+req.ip],
        email: tempemail['hos'+req.ip]
      });
      dat.save();
      
    } else if (act=='reject') {
      res.render('adminpage',{
        step1: "",
        step2: "active",
        prevbut: "",
        form1: "hidden",
        form2: "",
        nameOfHospital: tempname['hos'+req.ip]
      });
    }
    latt.delete('hos'+req.ip);
    longt.delete('hos'+req.ip);
    addr.delete('hos'+req.ip);
  };