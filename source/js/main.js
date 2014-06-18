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
 

var authToken;

/**
 * Number of minutes divided by amount to be reduced.
 * e.g. 04/0.01 means you will sober up 0.01% every forty minutes
 * @const
 * @type {number}
 */
var SOBRIETY_SPEED = (0.01 / 40);
 
/**
 * Initializes all the aspects of the javascript environment
 */
$(document).ready(function() {
	debug("Starting to initialize program.");
	
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
		debug("Clicked on the 1 drink button");
		drink(1,'booze');
	});
	
	// Clicking Facebook will enable/authenticate Facebook
	$("#facebooktoggle").click(checkAndTogglePostFacebook);
	
	// Other drink button drinks on that page and transitions back.
	$("#otherdrinkbutton").click(otherDrink)
	
	// Select drink changes which "other drink" amount is highlighted.
	$(".drinkchoice").click(selectDrink)
	
	// Settings - Clicking Sober will make you sober
	$('#sober').click(sober);
	
	// Settings - Sobriety Level changes updates sobriety settings
	$('#sobrietyLevel').change(function() {
		var newLevel = parseFloat($('#sobrietyLevel').val());
		if(isNaN(newLevel)) {
			$('#sobrietyLevel').val(getSobrietyLevel());
		} else {
			localStorage.setItem("sobrietyLevel",sobrietyLevel);
			updateElements();
		}
	});
	
	// Settings - Weight settings updates weight level
	$('#weight').change(function() {
		var newLevel = parseFloat($('#weight').val());
		if(isNaN(newLevel)) {
			$('#weight').val(getWeight());
		} else {
			localStorage.setItem("weight",weight);
			updateElements();
		}
	});

	// Fix the height of the tiles on the homepage.
	$('.quad').css('height', quadHeight + "px");
	$('.quad').css('line-height', quadHeight + "px");
	
	// If the window is resized, update the height
	// of the tiles.
	$(window).resize(function() {
		var viewportHeight = $(window).height();
		var quadHeight = (viewportHeight - 44) / 2;
		$('.quad').css('height', quadHeight + "px");
		$('.quad').css('line-height', quadHeight + "px");
	});
	
	// Load the sessions values out of localstorage
	loadSessionValues();
		
	// Setup the time to re-run every 5 minutes
	backgroundUpdate();
});

/**
 * Loads all of the values out of localstorage and sets the
 * UI based on the loaded values.
 */
function loadSessionValues() {
  // Execute on the configuration fields.
  var sobrietyLevel = getSobrietyLevel(),
      weight = getWeight(),
      startTime = getStartTime(),
      totalConsumed = getTotalConsumed(),
      facebookToggle = getFacebookToggle();
        
  $('#sobrietyLevel').val(sobrietyLevel);
  $('#weight').val(weight);
  
  if(facebookToggle) {
	  $('#facebooktoggle').removeClass('facebookoff');
	  $('#facebooktoggle').addClass('facebookon');
  } else {
	  $('#facebooktoggle').removeClass('facebookon');
	  $('#facebooktoggle').addClass('facebookoff');
  }
  
  if(totalConsumed && totalConsumed > 0) {
  	// If we are completely sober, than we need to start drinking over now.
    if(getElapsedMinutes(startTime) > getTotalMinutesForSobriety(totalConsumed, 0)) {
      sober();
    }
  } else {
    // We haven't had anything to drink yet, so start drinking over now.
  	sober();
  }
}

/**
 * Marks the drinker as Sober and then updates the UI to reflect this.
 */
function sober() {
      localStorage.removeItem("startTime");
  	  localStorage.removeItem("totalConsumed");
      updateElements();
}

/**
 * Take a drink and update as required.
 *
 * @param {number} amount number of 'shots' that is in the drink
 * @param {string} drinkname the name of the drink being consumed
 */
function drink(amount, drinkname) {
  var totalConsumed = getTotalConsumed(),
      facebookToggle = getFacebookToggle();
  
  debug("drink - Starting total consumed [" + totalConsumed + "]");
  // If this is our first drink, mark us as Sober so that drinking can begin
  if(totalConsumed <= 0) {
  	debug("drink - total consumed [" + totalConsumed + "] is <= 0 so changing to sober");
    sober();
  }
  
  totalConsumed += (getDrinkValueAmount() * amount);
  localStorage.setItem("totalConsumed",totalConsumed)
  
  if(facebookToggle && drinkname == 'booze') {
      FB.api('/me/feed', 'post', { message: "I'm enjoying booze, but too lazy to tell you what kind." }, function(response) {});
  } else if (facebookToggle && drinkname == 'custom') {
  	
  }
  
  debug("drink - Ending total consumed [" + totalConsumed + "]");
  updateElements();
}

/*
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
*/

/**
 * Uses the current weight of the user to do a lookup against the standardized
 * tables for how much BaC enters from each drink.
 *
 * @nosideeffects
 * @return {number} the amount of BaC to enter
 */
function getDrinkValueAmount() {
  var weight = getWeight(),
      weightLookup = Math.floor((weight - 100) / 20),
      result = 0.019;
      
  switch(weightLookup) {
	  case 0: result = 0.045; break;
	  case 1: result = 0.038; break;
	  case 2: result = 0.032; break;
	  case 3: result = 0.028; break;
	  case 4: result = 0.025; break;
	  case 5: result = 0.023; break;
	  case 6: result = 0.021; break;
	  case 7: result = 0.019; break;
  }
        
  return result;
}

/**
 * Calculates the number of minutes left until the drinker becomes
 * sober.
 *
 * @nosideeffects
 * @param {number} totalConsumed the amount of BaC total that has been consumed
 * @param {number} sobrietyLevel the level at which the drinker is considered sober
 * @return {number} the number of minutes until the drinker is sober
 */ 
function getTotalMinutesForSobriety(totalConsumed, sobrietyLevel) {
  return Math.floor((totalConsumed - sobrietyLevel) / (SOBRIETY_SPEED));
}

/**
 * Calculates the current BaC of the drinker
 *
 * @nosideeffects
 * @param {number} totalConsumed the amount of BaC total that has been consumed
 * @param {Date} startTime when did the drinker start
 * @return {number} the BaC of the current drinker
 */
function getBAC(totalConsumed, startTime) {
  return totalConsumed - (getElapsedMinutes(startTime) * SOBRIETY_SPEED);
}

/**
 * Gets the number of elapsed minutes since this night of debauchery began.
 *
 * @nosideeffects
 * @param {Date} startTime when did the drinking beging
 * @return {number} the number of minutes since drinking began
 */
function getElapsedMinutes(startTime) {
  var now = new Date();    
  var difference = Math.floor((now - startTime) / (1000 * 60));
  
  return difference;
}

/**
 * Updates all of the visual elements on the screen based on the current
 * drinking information.
 */
function updateElements() {
  var totalConsumed = getTotalConsumed(),
  	  startTime = getStartTime(),
  	  sobrietyLevel = getSobrietyLevel(),
      remainingMinutes = getTotalMinutesForSobriety(totalConsumed, sobrietyLevel) - getElapsedMinutes(startTime),
      bac = getBAC(totalConsumed, startTime);      

  debug("updateElements - totalConsumed [" + totalConsumed + "], startTime ["
  	+ startTime + "], sobrietyLevel [" + sobrietyLevel + "], remainingMinutes ["
  	+ remainingMinutes + "], bac [" + bac + "]");

  if(remainingMinutes > 0) {
    $('#minutesLeft').html(remainingMinutes + " minutes");
  } else {
    if( bac > (sobrietyLevel * 0.7) ) {
    	$('#minutesLeft').html("Gettin' There");
    } else if (bac > (sobrietyLevel * 0.3)) {
    	$('#minutesLeft').html("Sober");
    } else {
    	$('#minutesLeft').html("Stone Cold!");
    }
  }

  $('#totalConsumed').html(totalConsumed);  
  $('#drinkValueAmount').html(getDrinkValueAmount());
  $('#startTime').html(startTime.toLocaleTimeString());
  $('#totalMinutesForSobriety').html(getTotalMinutesForSobriety(totalConsumed, sobrietyLevel));
  $('#elapsedMinutes').html(getElapsedMinutes(startTime));
  $('#remainingMinutes').html(remainingMinutes);
  $('#bac').html(getBAC(totalConsumed, startTime));
}

/**
 * Controls the visual change when a user selects different drink
 * amounts from the custom drink page.
 *
 * @this {Element} the div that was clicked on indicating the drink
 */
function selectDrink() {
	if(!$(this).hasClass('selectdrink')) {
		$('.selectdrink').removeClass('selectdrink');
		$(this).addClass('selectdrink');		
	}	
}

/**
 * Action when the user drinks on the custom amount page.
 */
function otherDrink() {
	var drinkBac = $(".selectdrink").first().attr("data-drinkbac"),
	    drinkName = $("#customdrinkname").val();
	    
	if(_.isEmpty(drinkName)) {
		drinkName = 'custom';
	}
	drink(drinkBac,drinkName);

	$("#customdrinkpage").slideUp('slow');
	$("#mainpage").slideDown('slow');
	
}

/**
 * Updates the values on the screen and starts the timer to update the 
 * values on the screen every five minutes.
 */
function backgroundUpdate() {
  updateElements();
  setTimeout("backgroundUpdate()", 30000);
}

/*
function updatePhotoMessage() {
	document.getElementById("photomessage").value=getDrinkMessage();
}
*/

/**
 * This function enables toggling on the Facebook post.
 */
function checkAndTogglePostFacebook() {
	var facebookToggle = getFacebookToggle();
	
	debug("checkAndTogglePostFacebook - facebookToggle [" + facebookToggle + "]");
	
	// If post to Facebook is "on" just toggle it to "off"
	if(facebookToggle) {
 		localStorage.setItem("facebookToggle", false);
  	    $('#facebooktoggle').removeClass('facebookon');
	    $('#facebooktoggle').addClass('facebookoff');
	} else {
		// If post to Facebook is "off" that we need to ensure
		// the user is logged in and then we would toggle it
		// to on.
		debug("Checking Facebook login status");
		FB.getLoginStatus(function(response) {
			debug("checkAndTogglePostFacebook - response.status [" + response.status + "]");
			if (response.status === 'connected') {
				localStorage.setItem("facebookToggle", true);
                $('#facebooktoggle').removeClass('facebookoff');
                $('#facebooktoggle').addClass('facebookon');
			} else {
				// TODO: Facebook Login
			}
		});
	}

  // Check if Facebook is authorized.
  /*
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
  */
}

/*
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


/**
 * Gets the start time for when the night of drinking began.
 * There is logic that when you BaC falls below zero, the start time
 * value will get set back to right now.
 *
 * @nosideeffects
 * @return {Date} the start time as a Date object
 */
function getStartTime() {
	var startTime = localStorage.getItem("startTime");
	if(startTime) {
		startTime = new Date(startTime);
	} else {
		startTime = new Date();
		localStorage.setItem("startTime", startTime);
	}
	
	return startTime;
}

/**
 * Tracks the amount of BaC consumed. Each time you take a drink
 * it multiplies the number of "shots" of the drink by the amount
 * of BaC provided using a weight table lookup.
 *
 * @nosideeffects
 * @return {number} the current total consumed.
 */
function getTotalConsumed() {
	var totalConsumed = parseFloat(localStorage.getItem("totalConsumed"));
	if(isNaN(totalConsumed)) {
		totalConsumed = 0;
		localStorage.setItem("totalConsumed",totalConsumed);
	}
	
	return totalConsumed;
}

/**
 * Gets the users weight used to calculate the BaC.
 *
 * @nosideeffects
 * @return {number} the weight of the user
 */
function getWeight() {
	var weight = localStorage.getItem("weight");
	weight = parseFloat(weight);
	
	if(isNaN(weight)) {
		weight = 155;
		localStorage.setItem("weight", weight);
	}
	
	return weight;
}

/**
 * Gets the level at weight the user considers herself sober.
 *
 * @nosideeffects
 * @return {number} the sobriety level.
 */
function getSobrietyLevel() {
	var sobrietyLevel = localStorage.getItem("sobrietyLevel");
	sobrietyLevel = parseFloat(sobrietyLevel);
	
	if(isNaN(sobrietyLevel)) {
		sobrietyLevel = 0.05;
		localStorage.setItem("sobrietyLevel", sobrietyLevel);
	}
	
	return sobrietyLevel;
}

/**
 * Gets the post to facebook toggle
 *
 * @nosideeffects
 * @return {boolean} if the facebook toggle is on
 */
function getFacebookToggle() {
	var facebookToggle = localStorage.getItem("facebookToggle");
	if(facebookToggle === 'true') {
		facebookToggle = true;
	} else {
		facebookToggle = false;
	}
	
	return facebookToggle;
}

/**
 * Allows for debugging that can be disabled.
 * @param {string} message the loggable message
 */
function debug(message) {
	console.log(message);
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

/** START: Facebook Integration */
window.fbAsyncInit = function() {
	FB.init({
		appId      : '485749798118743', // App ID
		channelUrl : 'http://isober.chaosserver.net/channel.html', // Channel File
		status     : true, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		xfbml      : true  // parse XFBML
	});
};
// Load the SDK asynchronously
(function(d){
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "https://connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));
/** END: Facebook Integration */