// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  document.getElementById("erreur").style.visibility = "hidden";
 
  document.getElementById("startbutton").addEventListener("click", function( event ) {
    var init = true;
    var capVrai  = 0., capReel = 0.;
    var latRad0 = 0., longRad0 = 0., latDeg = 0., lonDeg = 0.;
    var vitesse = 0.;
    var derive = {"dist":0., "unit":" m"}
    var temps0 = 0, temps = 0.;

    var options = {
      enableHighAccuracy: true,
      maximumAge        : 0,
      timeout           : Infinity
    };
    
    if (!navigator.geolocation){
      displayErrorMessage("erreur-geoloc");
      return;
    }
    
    var _this = this;

    function success(position) {
      if (position.coords.accuracy > 5.) { 
	document.getElementById("precision").innerHTML = position.coords.accuracy.toFixed(1);
	return;
      }
      
      var latDeg = position.coords.latitude;
      var lonDeg = position.coords.longitude;
      
      if (!capVrai) {
        _this.setAttribute("data-l10n-id", "redemarrer");
        capVrai  = position.coords.heading;
        latRad0 = latDeg.toRadian();
        longRad0 = lonDeg.toRadian();
        temps0 = position.timestamp;

        document.getElementById("capvrai").innerHTML = Math.round(capVrai);
      }
      
      else {
        latRad = latDeg.toRadian();
        longRad = lonDeg.toRadian();
        capReel = calculCapReel(latRad0, longRad0, latRad, longRad);
        derive = calculdDerive(latRad0, longRad0, latRad, longRad, capVrai);
	
	      temps = Math.round((position.timestamp - temps0).toFixed(1) / 1000.);
      }
  
      vitesse = position.coords.speed;
      vitesse *= 3600./1852.; // conversions des m/s en noeuds
      
      document.getElementById("vitesse").innerHTML = vitesse.toFixed(1);
      document.getElementById("capreel").innerHTML = Math.round(capReel);
      document.getElementById("latitude").innerHTML = latDeg.deg2DegMinSec("N");
      document.getElementById("longitude").innerHTML = lonDeg.deg2DegMinSec("E");
      
      if (derive["unit"] === " m") {
        document.getElementById("derive").innerHTML = Math.round(derive["dist"]);
      }
      else {
        document.getElementById("derive").innerHTML = derive["dist"].toFixed(1);
      }
      document.getElementById("unit").innerHTML = derive["unit"];
      
      document.getElementById("precision").innerHTML = position.coords.accuracy.toFixed(1);
      document.getElementById("temps").innerHTML = temps.toHHMMSS();
	
    };
    
    function error() {
      navigator.geolocation.clearWatch(geo);
      displayErrorMessage("erreur-position");
    };
  
    document.getElementById("close").addEventListener("click", function(event) {
      if (geo) {navigator.geolocation.clearWatch(geo);}
      window.close();
    });
    
    var geo = navigator.geolocation.watchPosition(success, error, options);
    
  });
  
  document.getElementById("errorbutton").addEventListener("click", function(event) {
    document.getElementById("erreur").style.visibility="hidden";
  });
  
  document.getElementById("close").addEventListener("click", function(event) {
    window.close();
  });
});

function displayErrorMessage(message) {
  document.getElementById("afficheurs").style.visibility="hidden";
  document.getElementById("erreur").style.visibility="visible";
  document.getElementById("errormessage").setAttribute("data-l10n-id", message);
  
  return;
};

/* calcul du cap entre 2 coordonnées */
function calculCapReel(lat1, lon1, lat2, lon2) {
  var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
  
  cap = Math.atan2(y, x).degrees();
  cap = (cap + 360.) % 360.;
  
  return cap;
};

/* Calcul des coordonnées sans dérive */
/* (coordonnées sachant coordonnées initales, cap et distance parcourue) */
function calculCoordSsDerive(lat1, lon1, capVrai, dist) {
  var R = 6371000.; // rayon moyen de la Terre en mètre
  var capVraiRad = capVrai.toRadian();
  var newLat = Math.asin(Math.sin(lat1) * Math.cos(dist/R) + Math.cos(lat1) * Math.sin(dist/R) * Math.cos(capVraiRad) );
  var newLon = lon1 + Math.atan2(Math.sin(capVraiRad) * Math.sin(dist/R) *Math.cos(lat1), Math.cos(dist/R) - Math.sin(lat1) * Math.sin(newLat));
  
  var coord = {"lat":newLat, "lon":newLon};
  return coord;
};

/* Calcul de la distance entre 2 coordonnées */
function calculDistEntreCoord(lat1, lon1, lat2, lon2) {
  var R = 6371000.; // rayon moyen volumètrique de la Terre en mètre
  var deltaLat = lat2 - lat1;
  var deltaLon = lon2 - lon1;

  var a = Math.sin(deltaLat/2.) * Math.sin(deltaLat/2.) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon/2.) * Math.sin(deltaLon/2.);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1.-a));
  
  var d = R * c;

  return d;
  
};

/* Calcul de la dérive */
function calculdDerive(lat1, lon1, lat2, lon2, capVrai) {
  var derive = {"dist":0., "unit":" m"};
  /* calcul de la distance parcourue */
  /* entre coordonnées initiales et coordonnées actuelles */
  var dist = calculDistEntreCoord(lat1, lon1, lat2, lon2);
  
  /* calcul des coordonnées si cap vrai maintenu sans dérive sur la même distance */
  var coord = calculCoordSsDerive(lat1, lon1, capVrai, dist);
  
  /* Calcul de la dérive: */
  /* distance entre coordonnées actuelles et */
  /* coordonnées si cap vrai maintenu sans dérive sur la même distance */
  derive["dist"] = calculDistEntreCoord(coord["lat"], coord["lon"], lat2, lon2);
  
  /* distance en mile nautique: 1NM = 1852m */
  /* si distance < 0.1 NM, affichage en metre */
  if (derive["dist"] >= 185.2) {
    derive["dist"] = derive["dist"] / 1852.;
    derive["unit"] = " NM";
  }
  
  return derive;
};

Number.prototype.deg2DegMinSec = function(direction) {
  var degree = this;
  
  if (degree < 0) {
    switch(direction){
      case "E":
        direction = "W";
        break;
      case "N":
        direction = "S";
        break;
    }
    degree = degree * (-1.);
  }
  
  var deg = Math.floor(degree);
  
  var min = (degree - deg)*100.;
  min = min*60./100.;
  
  min = min.toFixed(1);
  
  if (deg < 10) {deg = "&nbsp;"+deg.toString();}
  if (min < 10) {min = "0"+min.toString();}
  var degMinSec = deg + "°"+ min + "' " + direction;
  
  return degMinSec;
  
};

Number.prototype.toRadian = function() {
  return this * Math.PI / 180.;
};

Number.prototype.degrees = function() {
  return this * 180. / Math.PI;
};

Number.prototype.toHHMMSS = function() {
    var sec_num = this;
    var hours   = Math.floor(sec_num / 3600.);
    var minutes = Math.floor((sec_num - (hours * 3600.)) / 60.);
    var seconds = sec_num - (hours * 3600.) - (minutes * 60.);

    if (hours   < 10) {hours   = "0"+hours.toString();}
    if (minutes < 10) {minutes = "0"+minutes.toString();}
    if (seconds < 10) {seconds = "0"+seconds.toString();}

    var time = hours + ':' + minutes + ':' + seconds;

    return time;
};