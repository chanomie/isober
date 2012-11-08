var totalConsumed = 0;
var startTime;

// Configurations
var weight = 160;
var sobrietyLevel = 0.05;

// Number of minutes divided by amount to be reduced.
// e.g. 04/0.01 means you will sober up 0.01% every forty minutes
var sobrietySpeed = (0.01 / 40);


// Global Variables:
var bacSlider;
var weightSlider;
var weightLookup;

function onloadIndex() {  
  cookieLoad();
  onloadConfigure();
  backgroundUpdate();
  
  window.scrollTo(0, 1);
}

function onloadCustom() {
  cookieLoad();
  window.scrollTo(0, 1);
}

function onloadConfigure() {
  bacSlider = new Slider(document.getElementById("bac-slider"),
                       document.getElementById("bac-slider-input"));
  var bacText = document.getElementById("bac-text-input");

  weightSlider = new Slider(document.getElementById("weight-slider"),
                       document.getElementById("weight-slider-input"));
  var weightText = document.getElementById("weight-text-input");
  
  bacText.value = sobrietyLevel;
  bacSlider.setMinimum(0);
  bacSlider.setMaximum(10);
  bacSlider.setBlockIncrement(1);
  bacSlider.setValue(sobrietyLevel * 100);
  bacSlider.onchange=bacSliderChange;
  
  weightText.value = weight;
  weightSlider.setMinimum(100);
  weightSlider.setMaximum(240);
  weightSlider.setBlockIncrement(20);
  weightSlider.setUnitIncrement(20);
  weightSlider.setValue(weight);
  weightSlider.onchange=weightSliderChange;
}

function bacSliderChange() {
  var bacText = document.getElementById("bac-text-input");
  sobrietyLevel = (bacSlider.getValue()) / 100;
  bacText.value = sobrietyLevel;
  
  createCookie("sobrietyLevel",sobrietyLevel,"30");
  updateElements();
}

function weightSliderChange() {
  var weightText = document.getElementById("weight-text-input");
  weightText.value = weightSlider.getValue();
  weight = weightText.value;
  
  createCookie("weight",weightText.value,"30");
  updateElements();
}

function cookieLoad() {
  // Execute on the configuration fields.
  var iSobrietyLevel = readCookie("sobrietyLevel");
  if(iSobrietyLevel) {
    sobrietyLevel = parseFloat(iSobrietyLevel);
  }
  
  var iWeight = readCookie("weight");
  if(iWeight) {
    weight = parseFloat(iWeight);
  }
  

  // Execute on the fields for a night of drinking
  var iStartTime = readCookie("startTime");
  var iTotalConsumed = parseFloat(readCookie("totalConsumed"));
  var iStartDate = new Date(iStartTime);
  
  if(iTotalConsumed) {
    if(getElapsedMinutes(iStartDate) > getTotalMinutesForSobriety(iTotalConsumed, 0)) {
      eraseCookie("startTime");
  	  eraseCookie("totalConsumed");
    } else {
      totalConsumed = iTotalConsumed;
      startTime = iStartDate;
    }
  } else {
  	eraseCookie("startTime");
  	eraseCookie("totalConsumed");
  }
  
  var facebookstate = localStorage.getItem("facebookstate");
  if(facebookstate) {
    document.getElementById('postfacebook').checked = facebookstate;
  }

}

function sober() {
      eraseCookie("startTime");
  	  eraseCookie("totalConsumed");
      totalConsumed = 0;
      startTime = null;
      updateElements();
}

function drink(amount, drinktype, drinkname) {
  if(totalConsumed <= 0) {
    startTime = new Date();
    createCookie("startTime",startTime,"2")
  }
  
  totalConsumed += (getDrinkValueAmount() * amount);
  createCookie("totalConsumed",totalConsumed,"2")
  
  if(document.getElementById('postfacebook').checked) {
    var beverageUrl = "http://isober.chaosserver.net/drink.php";
    if (drinktype == "beer") {
      beverageUrl += "?drinktype=beer";
    } else if (drinktype == "wine") {
      beverageUrl += "?drinktype=wine";
    } else if (drinktype == "shot") {
      beverageUrl += "?drinktype=shot";
    } else {
      beverageUrl += "?drinktype=booze";
    }  

    if(!isBlank(drinkname)) {
      beverageUrl += "&drinkname=" + encodeURIComponent(drinkname);
    }

    FB.api('/me/isoberapp:drink',
      'post', 
      { beverage : beverageUrl },
      function(response) {});
  }
  
  updateElements();
  return false;
}

function getDrinkValueAmount() {
  if(!weightLookup) {
    weightLookup = new Array(); 
    weightLookup[0] = 0.045;
    weightLookup[1] = 0.038;
    weightLookup[2] = 0.032;
    weightLookup[3] = 0.028;
    weightLookup[4] = 0.025;
    weightLookup[5] = 0.023;
    weightLookup[6] = 0.021;
    weightLookup[7] = 0.019;
  }
  
  return weightLookup[Math.floor((weight - 100) / 20)];
}

function getTotalMinutesForSobriety(iTotalConsumed, iSobrietyLevel) {
  return Math.floor((iTotalConsumed - iSobrietyLevel) / (sobrietySpeed));
}

function getBAC(iTotalConsumed, iStartTime) {
  return iTotalConsumed - (getElapsedMinutes(iStartTime) * sobrietySpeed);
}

function getElapsedMinutes(iStartTime) {
  var now = new Date();    
  var difference = Math.floor((now - iStartTime) / (1000 * 60));
  
  return difference;
}

function adddrink() {
  var drinkvalue = document.getElementById('customdrink').value;
  var drinktype = document.getElementById('drinktype').value;
  var drinkname = document.getElementById('customdrinkname').value;
  drink(parseFloat(drinkvalue), drinktype, drinkname); 
  return false;
}

function updateElements() {
  var remainingMinutes = getTotalMinutesForSobriety(totalConsumed, sobrietyLevel) - getElapsedMinutes(startTime);
  var bac = getBAC(totalConsumed, startTime);
  if(remainingMinutes > 0) {
    document.getElementById('minutesLeft').innerHTML = "" + remainingMinutes + " minutes";
  } else {
    if( bac > (sobrietyLevel * 0.7) ) {
    	document.getElementById('minutesLeft').innerHTML = "Gettin' There";
    } else if (bac > (sobrietyLevel * 0.3)) {
    	document.getElementById('minutesLeft').innerHTML = "Sober";
    } else {
    	document.getElementById('minutesLeft').innerHTML = "Stone Cold!";
    }
  }

  document.getElementById('totalConsumed').innerHTML = "" + totalConsumed;
  document.getElementById('drinkValueAmount').innerHTML = "" + getDrinkValueAmount();
  document.getElementById('startTime').innerHTML = "" + startTime;
  document.getElementById('totalMinutesForSobriety').innerHTML = "" + getTotalMinutesForSobriety(totalConsumed, sobrietyLevel);
  document.getElementById('elapsedMinutes').innerHTML = "" + getElapsedMinutes(startTime);
  document.getElementById('remainingMinutes').innerHTML = "" + remainingMinutes;
  document.getElementById('bac').innerHTML = "" + getBAC(totalConsumed, startTime);
}

function backgroundUpdate() {
  updateElements();
  setTimeout("backgroundUpdate()", 30000);
}

function toggleHide(divname) {
	if(document.getElementById(divname).style.display == 'none') {
		document.getElementById(divname).style.display = 'visible';
	} else {
		document.getElementById(divname).style.visibility = 'none';
	}
}

function togglePostFacebook() {
  if(document.getElementById('postfacebook').checked == true) {
    document.getElementById('postfacebook').checked = false;
  } else {
    document.getElementById('postfacebook').checked = true;  
  }

  saveFacebook();
}

function saveFacebook() {
  localStorage.setItem("facebookstate", document.getElementById('postfacebook').checked);
}


function createCookie(name,value,days) {
    localStorage.setItem(name, value);
    /*
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
	*/
}

function readCookie(name) {
    return localStorage.getItem(name);
    /*
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
	*/
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}