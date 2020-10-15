
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    alert("Location is not supported. Please choose the alternate option to enter locality.");
  }
}

function showPosition(position) {
    document.getElementsByName("lati").value = position.coords.latitude; 
  alert( document.getElementsByName("lati").value);
  document.getElementsByName("longi").value = position.coords.longitude;
  // $( "input[name='lati']" ).val( position.coords.latitude);
  // $("input[name='longi']").val(position.coords.longitude);
  
}