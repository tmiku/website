// these outside of ready() because need em in global scope
var guessMap;
var outlineMap;
var outline;
var guessMark;
var guessSet = false;
var goalPoint;
var submitButtonState = "grayed"; //grayed, marked, or next
var score = 0;
var round = 1;
var scoreLine;
var goalMark;
var acts;

var totalRounds = 5;
var maxRoundScore = 1000;
var maxTotalScore = totalRounds * maxRoundScore;

var custMark = new L.Icon({
  iconUrl: 'images/marker.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

//clear data when people leave
addEventListener("beforeunload", (event) => {sessionStorage.clear()});

$(() => { //document ready handler
  //make sure guess button starts disabled
  $("#submitButton").attr("disabled", true);
  $("#submitButton").css({"background-color": "#fadbc5", "color": "#fc4c02"})  
  if (!sessionStorage.getItem("GetLostActivity")){
        alert("Unable to retrieve saved activity info. This is weird - contact Tim about it.");
        setTimeout(() => {window.location.replace(window.location.origin+"/getlost/")}, 3000)
    }
    acts = JSON.parse(sessionStorage.getItem("GetLostActivity"));
    const tok = sessionStorage.getItem("GetLostToken");
    
    //initialize outline map
    outlineMap = L.map('outlinemap', {attributionControl: false}).setView([0,0], 13);
    //initialize guess map
    guessMap = L.map('guessmap', {attributionControl: false}).setView([38.404,-96.182],2);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 1,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    ).addTo(guessMap);

    //set up guess marker click handler
    guessMap.on('click', function(e) {
    if (!guessSet && submitButtonState != "next") {
      guessMark = L.marker([e.latlng.lat,e.latlng.lng],{icon: custMark}).addTo(guessMap); 
      guessSet = true;
      $("#submitButton").removeAttr("disabled");
      $("#submitButton").css({"background-color": "#fc4c02", "color": "white", "cursor":"pointer"})
      submitButtonState = "marked";
    }
    else if (submitButtonState != "next") {guessMark.setLatLng([e.latlng.lat,e.latlng.lng]);}
    console.log("This click scores " + scoreGuess()); // DEBUG: remove this
    if (submitButtonState == 'grayed') {
      submitButtonState = 'marked';
      $("#submitButton").css({"background-color": "#fc4c02", "color": "white", "cursor":"pointer"});
      $("#submitButton").html("submit guess");}
  });

    //set up submit/next click handler
    $("#submitButton").on("click", function() {
      onSubmitClick();
    });

    //display first path
    drawOutlineMap(acts[0][1]);
})


function decode(encodedPath) {
    // This function was derived from Google Maps' js-polyline-codec package
    // The modification were made by Tim Mikulski on 5/29/2023
    // js-polyline-codec is licensed under the Apache License 2.0
    // A copy of that license is available at http://www.apache.org/licenses/LICENSE-2.0
  
    //  Decode Google Maps polyline into array of [Lat, Long] tuples, 5 decimal pt precision
    const precision = 5;
    const factor = Math.pow(10, precision);
    const len = encodedPath.length;
    const path = new Array(Math.floor(encodedPath.length / 2));
    let index = 0;
    let lat = 0;
    let lng = 0;
    let pointIndex = 0;
    for (; index < len; ++pointIndex) {
      let result = 1;
      let shift = 0;
      let b = 0;
      do {
        b = encodedPath.charCodeAt(index++) - 63 - 1;
        result += b << shift;
        shift += 5;
      } while (b >= 0x1f);
      lat += result & 1 ? ~(result >> 1) : result >> 1;
  
      result = 1;
      shift = 0;
      do {
        b = encodedPath.charCodeAt(index++) - 63 - 1;
        result += b << shift;
        shift += 5;
      } while (b >= 0x1f);
      lng += result & 1 ? ~(result >> 1) : result >> 1;
  
      path[pointIndex] = [lat / factor, lng / factor];
    }
    path.length = pointIndex;
    return path;
  }  

function drawOutlineMap(encodedPath) { //draw guess map given gmaps polyline
  let path = decode(encodedPath);
  outline = L.polyline(path, {color: '#fc4c02'}); 
  goalPoint = path[Math.floor(Math.random() * path.length)];
  outlineGoal = L.marker(goalPoint,{icon: custMark}).addTo(outlineMap)
  
  // get important info about raw polyline
  const transposed = path[0].map((col, i) => path.map(row => row[i]));
  
  // const max = arr.reduce((a, b) => Math.max(a, b), -Infinity);
  const maxLat = transposed[0].reduce((a,b)=>Math.max(a,b),-Infinity)
  const minLat = transposed[0].reduce((a,b)=>Math.min(a,b),Infinity)
  const maxLon = transposed[1].reduce((a,b)=>Math.max(a,b),-Infinity)
  const minLon = transposed[1].reduce((a,b)=>Math.min(a,b),Infinity)

  const width = maxLon - minLon;
  const height = maxLat - minLat;
  const center = [minLat + 0.5 * (maxLat - minLat),minLon + 0.5 * (maxLon - minLon)];

  //center based on new polyline
  console.log("Found bounds for activity:", outline.getBounds());
  outlineMap.fitBounds(outline.getBounds()); //WHY IS THIS NOT WORKING THE SECOND TIME

  // add new polyline
  //outline = L.polyline(path, {color: 'red'}); 
  outline.addTo(outlineMap);
  outlineGoal.addTo(outlineMap);

}

function resetGuessMap(){
  guessMap.setView([38.404,-96.182],2);
  scoreLine.removeFrom(guessMap);
  guessMark.removeFrom(guessMap);
  goalMark.removeFrom(guessMap);
  outline.removeFrom(guessMap);
  guessSet = false;
}

function scoreGuess(){ // gnarly usage of global variables sorry lol
  let x = guessMark.getLatLng().distanceTo(goalPoint) * .001; //dist in kms
  if (x < 0.03) {return 1000;}
  else {return Math.floor((900 * (.9985 ** x)) +(100 * (.85 ** x)));}
}

function illustrateScore(){ // lol more gross globals
  // get bounds of guess and outline to display result
  let outlineAndGuess = new L.FeatureGroup();
  outlineAndGuess.addLayer(guessMark);
  outlineAndGuess.addLayer(outline);
  guessMap.fitBounds(outlineAndGuess.getBounds());

  //draw outline, then goal marker, then score line
  outline.addTo(guessMap);
  goalMark = L.marker(goalPoint,{icon: custMark}).addTo(guessMap);
  scoreLine = L.polyline([guessMark.getLatLng(),goalPoint],{color: 'black', dashArray: '2 6'}).addTo(guessMap);

}

function onSubmitClick(){ // I was told that functional programming's for pussies, actually
  if (submitButtonState == 'grayed') {}
  if (submitButtonState == 'next') {
    // Logic to reset a round is in this block

    // Exit game if last round
    if (round == totalRounds) {
      wrapUpGame();
      return //don't do the rest of this block
    }
    round += 1; // Update round number
    //reset outline map, draw next activity
    outlineMap.remove();
    outlineMap = L.map('outlinemap', {attributionControl: false}).setView([0,0], 13);
    drawOutlineMap(acts[round-1][1]);
    
    resetGuessMap(); //reset guess map
    $("#roundlabel").html(round)
    $("#lastguess").html("???")
    submitButtonState = 'grayed'; //update button state
    $("#submitButton").attr("disabled", true);
    $("#submitButton").css({"background-color": "#fadbc5", "color": "#fc4c02", "cursor":"none"})
    $("#submitButton").html("submit guess")
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitButtonState == 'marked') {
    //Logic to submit a guess is in this block
    newScore = scoreGuess();
    score += newScore;
    illustrateScore();
    $("#lastguess").html(newScore)
    $("#totalscore").html(score)
    if (round==totalRounds) {
      $("#submitButton").html("finish game");
    } else {
      $("#submitButton").html("next activity");
    }
    submitButtonState = 'next';
    
  }
}

function wrapUpGame(){
  $("#maps").css("animation-duration","1s").css("animation-name","fadeOut").css("opacity",0)
  $("#myModal").css("display","block").css("animation-duration","1s").css("animation-name","fadeIn")
  $("#modal-p").html("Game finished! You scored " + score + " of " + (maxTotalScore) + " possible points.");
  $("#resetButton").click(restartGame)
}

function restartGame(){
  //reshuffle activities
  acts = acts.sort(() => 0.5 - Math.random());
  sessionStorage.setItem("GetLostActivity",JSON.stringify(acts));
  window.location.replace(window.location.origin+"/getlost/")
}