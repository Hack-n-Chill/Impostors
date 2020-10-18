const https=require('https');

let {addr,longt,latt,tempemail,tempname}=require('../models/variables');

exports.patientlocation=(req,res)=>{
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