<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US"
      xmlns:fb="http://ogp.me/ns/fb#">
      
<?php
  $drinkname = "Booze"; 
  $drinktype = "booze"; 
  $drinkimage = "http://isober.chaosserver.net/images/booze.png";
  $fburl = "http://isober.chaosserver.net/drink.php";
  
  if ($_GET["drinktype"] == "beer") {
    $drinkname = "Beer";
    $drinktype = "beer";
    $drinkimage = "http://isober.chaosserver.net/images/beer.png";
  } elseif ($_GET["drinktype"] == "wine") {
    $drinkname = "Wine"; 
    $drinktype = "wine"; 
    $drinkimage = "http://isober.chaosserver.net/images/wine.png";
  } elseif ($_GET["drinktype"] == "shot") {
    $drinkname = "Shot"; 
    $drinktype = "shot"; 
    $drinkimage = "http://isober.chaosserver.net/images/shot.png";
  }
  
  $fburl .= "?drinktype=" . $drinktype;
  if(isset($_GET['drinkname'])) {
    $drinkname = $_GET['drinkname'];
    $fburl .= "&amp;drinkname=" . urlencode($drinkname);
  }
  
?>
  <!--manifest="isober.manifest"-->
  <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# isoberapp: http://ogp.me/ns/fb/isoberapp#">
    <meta property="fb:app_id"           content="485749798118743" /> 
    <meta property="og:type"             content="isoberapp:beverage" /> 
    <meta property="og:url"              content="<?php echo $fburl; ?>" /> 
    <meta property="og:title"            content="<?php echo $drinkname; ?>" /> 
    <meta property="og:image"            content="<?php echo $drinkimage; ?>" /> 
    <meta property="isoberapp:drinkname" content="<?php echo $drinkname; ?>" /> 
      
    <title>iSober - <?php echo $drinkname ?></title>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta names="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
	  <meta name="viewport" content="width=device-width, user-scalable=no" />
	  <link rel="stylesheet" href="css/isober.css" />
	  <link rel="stylesheet" href="css/iPhoneButtons.css" />
      <link rel="stylesheet" href="css/RoundRectangle.css" />
      <link type="text/css" rel="StyleSheet" href="css/bluecurve/bluecurve.css" />
	  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
      <script type="text/javascript" src="js/range.js"></script>
      <script type="text/javascript" src="js/timer.js"></script>
      <script type="text/javascript" src="js/slider.js"></script>
	  <script type="text/javascript" src="js/isober.js"></script>
      <!-- script type="text/javascript" src="js/debug-offline.js"></script -->
  </head>
  <body>
      <div id="fb-root"></div>
      
      <script>
        window.fbAsyncInit = function() {
          FB.init({
            appId      : '485749798118743', // App ID
            status     : true, // check login status
            cookie     : true, // enable cookies to allow the server to access the session
            xfbml      : true  // parse XFBML
          });
        };
    
       (function(d, s, id) {
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) return;
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=485749798118743";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
      </script>
      
      <div id="beerpage">
        <p><a class="blackLeft button" href="index.html">Get iSober</a></p>
        <div style="float: left; padding-right: 10pt;">
          <img src="<?php echo $drinkimage; ?>" 
            height="100"
            width="100" 
            alt="<?php echo $drinkname ?>"></img>
        </div>
        <div>
          <h1><?php echo $drinkname ?></h1>
          <?php
            switch ($drinktype) {
              case "beer":
                ?>
                <p>Beer is the world's most widely consumed alcoholic beverage; it is the 
                third-most popular drink overall, after water and tea. It is thought by 
                some to be the oldest fermented beverage.  Beer is produced by the 
                saccharification of starch and fermentation of the resulting sugar. 
                The starch and saccharification enzymes are often derived from malted 
                cereal grains, most commonly malted barley and malted wheat. Unmalted 
                maize and rice are widely used adjuncts to lighten the flavor because 
                of their lower cost. The preparation of beer is called brewing. Most 
                beer is flavoured with hops, which add bitterness and act as a natural 
                preservative, though other flavourings such as herbs or fruit may 
                occasionally be included.</p>
                <?php
                break;
              case "wine":
                ?>
                <p>Wine is an alcoholic beverage made from fermented fruit juice, usually 
                from grapes. The natural chemical balance of grapes lets them ferment
                without the addition of sugars, acids, enzymes, or other nutrients.
                Yeast consumes the sugars in the grapes and converts them into alcohol. 
                Different varieties of grapes and strains of yeasts produce different 
                types of wine.</p>
                <?php
                break;
              case "shot":
                ?>
                <p>A shot is taken with a small glass designed to hold or measure
                spirits or liquor, which is either drunk straight from the glass 
                ("a shot") or poured into a cocktail.</p>
                <?php
                break;
              default:
                ?>
                <p>Booze is a drink containing ethanol, commonly known as alcohol. 
                Alcoholic beverages are divided into three general classes: beers, 
                wines, and spirits. They are legally consumed in most countries, 
                and over 100 countries have laws regulating their production, 
                sale, and consumption. In particular, such laws specify the 
                minimum age at which a person may legally buy or drink them.
                This minimum age varies between 16 and 25 years, depending upon 
                the country and the type of drink. Most nations set it at 18 
                years of age.</p>
                <?php
                break;
             }
          ?>          
        </div>
      </div>
  </body>
</html>
