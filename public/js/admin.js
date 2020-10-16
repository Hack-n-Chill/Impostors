
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    alert("Location is not supported. Please choose the alternate option to enter locality.");
  }
}

function showPosition(position) {
  const lati=position.coords.latitude;
  const longi=position.coords.longitude;
  const data={lati , longi};
  fetch('/admin/hospital/location', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }).then(res => {
    return res.text();
    
  }).then(fina=>{
    let modx=document.getElementById("address");
    modx.innerHTML=fina;
    console.log(fina);
  });
 
}

function savetodb() {
  fetch('/admin/hospital/save',{
    method: 'POST'
  });
}
function revert() {
  fetch('/admin/hospital/reject',{
    method: 'POST'
  });
}
let lati,longi;
let checker=false;
function getLocation2() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position=>{
      lati=position.coords.latitude;
      longi=position.coords.longitude;
      checker=true;
    });
  }
}