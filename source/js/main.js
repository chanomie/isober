/**
 * @preserve Copyright 2013 Jordan Reed
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *  
 *  http://code.google.com/p/isober/
 */
 
/**
 * Initializes all the aspects of the javascript environment
 */

$(document).ready(function() {
	var viewportHeight = $(window).height(),
	    quadHeight = (viewportHeight - 44) / 2;

	// Setup Page Transitions
	$("#otherdrink").click(function() {
		$("#mainpage").slideUp('slow');
		$("#customdrinkpage").slideDown('slow');
	});
	$('#customdone').click(function() {
		$("#customdrinkpage").slideUp('slow');
		$("#mainpage").slideDown('slow');
	});
	$("#settings").click(function() {
		$("#mainpage").slideUp('slow');
		$("#settingspage").slideDown('slow');
	});
	$('#settingsdone').click(function() {
		$("#settingspage").slideUp('slow');
		$("#mainpage").slideDown('slow');
	});
	// Page Transitions Complete


	// Clicking One Drink is Simple, just drink booze.
	$("#onedrink").click(function() {
	  drink(1,'booze');
	});
	
	// Clicking Facebook will enable/authenticate Facebook
	$("#facebooktoggle").click(checkAndTogglePostFacebook);
	
	$("#otherdrinkbutton").click(otherDrink)
	$(".drinkchoice").click(selectDrink)
	
	// Settings - Clicking Sober will make you sober
	$('#sober').click(sober);
	
	// Settings - Sobriety Level changes updates sobriety settings
	$('#sobrietyLevel').change(function() {
		var newLevel = parseFloat($('#sobrietyLevel').val());
		if(isNaN(newLevel)) {
			$('#sobrietyLevel').val(sobrietyLevel);
		} else {
			sobrietyLevel = newLevel;
			localStorage.setItem("sobrietyLevel",sobrietyLevel);
			updateElements();
		}
	});
	
	// Settings - Weight settings updates weight level
	$('#weight').change(function() {
		var newLevel = parseFloat($('#weight').val());
		if(isNaN(newLevel)) {
			$('#weight').val(weight);
		} else {
			weight = newLevel;
			localStorage.setItem("weight",sobrietyLevel);
			updateElements();
		}
	});

	// Fix the height of the tiles on the homepage.
	$('.quad').css('height', quadHeight + "px");
	$('.quad').css('line-height', quadHeight + "px");
	$(window).resize(function() {
		var viewportHeight = $(window).height();
		var quadHeight = (viewportHeight - 44) / 2;
		$('.quad').css('height', quadHeight + "px");
		$('.quad').css('line-height', quadHeight + "px");
	});
	
	loadSessionValues();
	backgroundUpdate();
});

var totalConsumed = 0;
var startTime = new Date();
var authToken;

// Configurations
var weight = 160;
var sobrietyLevel = 0.05;

// Number of minutes divided by amount to be reduced.
// e.g. 04/0.01 means you will sober up 0.01% every forty minutes
var sobrietySpeed = (0.01 / 40);
var weightLookup;

function loadSessionValues() {
  // Execute on the configuration fields.
  var iSobrietyLevel = localStorage.getItem("sobrietyLevel");
  if(iSobrietyLevel) {
    sobrietyLevel = parseFloat(iSobrietyLevel);
  }
  
  var iWeight = localStorage.getItem("weight");
  if(iWeight) {
    weight = parseFloat(iWeight);
  }
  $('#sobrietyLevel').val(sobrietyLevel);
  $('#weight').val(weight);


  // Execute on the fields for a night of drinking
  var iStartTime = localStorage.getItem("startTime");
  var iTotalConsumed = parseFloat(localStorage.getItem("totalConsumed"));
  var iStartDate = new Date(iStartTime);
  
  if(iTotalConsumed) {
    if(getElapsedMinutes(iStartDate) > getTotalMinutesForSobriety(iTotalConsumed, 0)) {
      localStorage.removeItem("startTime");
  	  localStorage.removeItem("totalConsumed");
    } else {
      totalConsumed = iTotalConsumed;
      startTime = iStartDate;
    }
  } else {
  	localStorage.removeItem("startTime");
  	localStorage.removeItem("totalConsumed");
  }
}

function sober() {
      localStorage.removeItem("startTime");
  	  localStorage.removeItem("totalConsumed");
      totalConsumed = 0;
      startTime = null;
      updateElements();
}

function drink(amount, drinktype, drinkname) {
  if(totalConsumed <= 0) {
    startTime = new Date();
    localStorage.setItem("startTime",startTime)
  }
  
  totalConsumed += (getDrinkValueAmount() * amount);
  localStorage.setItem("totalConsumed",totalConsumed)
  
  // if(document.getElementById('postfacebook').checked) {
  //	beverageShare = getDrinkMessage();
  //    FB.api('/me/feed', 'post', { message: beverageShare }, function(response) {});
  // }
  
  updateElements();
  return false;
}

function getDrinkMessage() {
    var drinktype = document.getElementById('drinktype').value;
    var drinkname = document.getElementById('customdrinkname').value;

    var beverageShare = "I'm enjoying ";

    if (drinktype == "beer") {
      if(isBlank(drinkname)) {
        beverageShare += "a glass of beer.";
      } else {
        beverageShare += "a glass of " + drinkname + " beer.";
      }
    } else if (drinktype == "wine") {
      if(isBlank(drinkname)) {
        beverageShare += "a glass of wine.";
      } else {
        beverageShare += "a glass of " + drinkname + " wine.";
      }
    } else if (drinktype == "shot") {
      if(isBlank(drinkname)) {
        beverageShare += "a shot.";
      } else {
        beverageShare += "a shot of " + drinkname + ".";
      }
    } else {
	    if(isBlank(drinkname)) {
	      beverageShare += "booze."
	    } else {
	      beverageShare += "a " + drinkname + ".";
	    }
    }
    
    return beverageShare;	
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
    $('#minutesLeft').html("" + remainingMinutes + " minutes");
  } else {
    if( bac > (sobrietyLevel * 0.7) ) {
    	$('#minutesLeft').html("Gettin' There");
    } else if (bac > (sobrietyLevel * 0.3)) {
    	$('#minutesLeft').html("Sober");
    } else {
    	$('#minutesLeft').html("Stone Cold!");
    }
  }

  $('#totalConsumed').html(_.isEmpty(totalConsumed) ? "" : totalConsumed);
  $('#drinkValueAmount').html(_.isEmpty(getDrinkValueAmount()) ? "" : getDrinkValueAmount());
  $('#startTime').html(_.isEmpty(startTime) || _.isUndefined(startTime) ? "" : startTime.toLocaleTimeString());
  $('#totalMinutesForSobriety').html(_.isEmpty(getTotalMinutesForSobriety(totalConsumed, sobrietyLevel)) ? "" : getTotalMinutesForSobriety(totalConsumed, sobrietyLevel));
  $('#elapsedMinutes').html(_.isEmpty(getElapsedMinutes(startTime)) ? "" : getElapsedMinutes(startTime));
  $('#remainingMinutes').html(_.isEmpty(remainingMinutes) ? "" : remainingMinutes);
  $('#bac').html(_.isEmpty(getBAC(totalConsumed, startTime)) ? "" : getBAC(totalConsumed, startTime));
}

function selectDrink() {
	if(!$(this).hasClass('selectdrink')) {
		$('.selectdrink').removeClass('selectdrink');
		$(this).addClass('selectdrink');		
	}	
}

function otherDrink() {
	var drinkBac = $(".selectdrink").first().attr("data-drinkbac"),
	    drinkName = $("#customdrinkname").val();
	    
	if(_.isEmpty(drinkName)) {
		drinkName = 'booze';
	}
	drink(drinkBac,drinkName);

	$("#customdrinkpage").slideUp('slow');
	$("#mainpage").slideDown('slow');
	
}

function backgroundUpdate() {
  updateElements();
  setTimeout("backgroundUpdate()", 30000);
}

function facebookAuthChange(response) {
  if(response.status == "connected") {
    authToken = response.authResponse.accessToken;
    // document.getElementById("photoform").action="https://graph.facebook.com/me/photos?access_token="+authToken;
    console.log("Need to set auth");
    
  } else {
    $("#facebooktoggle").addClass("facebookoff");
    $("#facebooktoggle").removeClass("facebookon");
  }
}

function updatePhotoMessage() {
	document.getElementById("photomessage").value=getDrinkMessage();
}

function checkAndTogglePostFacebook() {
  // Check if Facebook is authorized.
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      var accessToken = response.authResponse.accessToken;
      // document.getElementById("photoform").action="https://graph.facebook.com/me/photos?access_token="+authToken;
      console.log("Need to set auth");

    } else {
	  // Not logged in - so need to ask
	  console.log("Not logged in.");
    }
  });
}

function togglePostFacebook() {
	var facebookstate = localStorage.getItem("facebookstate");
    if(facebookstate) {
	    $("#facebooktoggle").removeClass("facebookoff");
	    $("#facebooktoggle").addClass("facebookon");
    } else {
	    $("#facebooktoggle").addClass("facebookoff");
	    $("#facebooktoggle").removeClass("facebookon");
    }
	localStorage.setItem("facebookstate", !facebookstate);
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}