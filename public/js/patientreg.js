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
    fetch('/newpatient/location', {
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
    fetch('/newpatient/location/save',{
      method: 'POST'
    });
  }
  
  function showlocform() {
    document.getElementById('unhide1').hidden=false;
    document.getElementById('unhide2').hidden=false;
    document.getElementById('unhidet').hidden=false;
    const ema=document.getElementById('email').value;
    document.getElementById('email2').value=ema;
  }