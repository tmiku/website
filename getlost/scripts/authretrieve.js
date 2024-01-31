//quick description of nesting functions here:
//first, get access token
//then, recordActivities alternates between calling getActivityPage and recordFromPage...
//...until we get an empty page (no return on that func, because it goes into session storage).
//lastly, the ready handler picks out N random activities and saves activity IDs and summary polylines to session storage

var NUM_ACTS = 5;
var ACTS_PER_PAGE = 3; //MAJOR DEBUG NOTE: CHANGE BACK TO 50!
var NUM_PAGES = 3;

$(() => { //document ready handler

    getAccessToken().then((data, textStatus, jqXHR) => { //get the access token request/response; then, when it's ready...
        console.log('data after thenning token req:')
	console.log(data)
	data = JSON.parse(atob(data))
	const userName = data.athlete.username;
        let tok = data.access_token;
        if (!tok) {logMessage('Failed to exchange authorization code for access token. Try again from <a class="loglink" href="/getlost/"> here</a>.')} else {logMessage('Access token received...' + tok)}
	logMessage('Beginning activity search...')
        sessionStorage.setItem("TotallyLostToken",tok);
        return recordActivities(tok);
    }).then(() => { //then, when all the activities are logged, save on off to local storage

        logMessage("Activity search complete.");
        // read in the activities from storage
        const allActivities = JSON.parse(sessionStorage.getItem("TotallyLostTempActs"));
        switch (allActivities.length) {
            case 0: logMessage('No activities found. Is your profile private? Did you remember to check the box on the home screen? <a class="loglink" href="/getlost/">Try again</a>.')
            default:
                logMessage('Found ' + allActivities.length + ' activities.');

        logMessage('Shuffling and selecting activities...');
        let shuffledActivities = allActivities.sort(() => 0.5 - Math.random()); 
        // after shuffling, just pick the first N elements, save em off.
        const chosenActivities = shuffledActivities.slice(0,NUM_ACTS);
        sessionStorage.setItem("TotallyLostActivity",JSON.stringify(chosenActivities));

        logMessage('Removing unused activities...')
        sessionStorage.removeItem("TotallyLostTempActs")

        logMessage('Activity load complete. Redirecting to game.')
        window.location.replace("http://mercury.local/getlost/guess.html"); //time to play!
        }
    })
})


async function getAccessToken() {
    //get authorization code, which Strava puts in the URL parameters of the redirect link
    let params = new URLSearchParams(window.location.search);
    var authcode = params.get('code');
    if (!authcode) {logMessage('Failed to retrieve authorization code from Strava redirect. Try again from <a class="loglink" href=/getlost/">the homepage</a>.')}
    else {logMessage('Received authorization code from Strava...')}
    logMessage('Exchanging authorization code for access token...')

    //use http POST to exchange authcode for a durable access token. It also returns athlete summary
    return $.get("http://mercury.local/mikuserv/stravaToken?code="+authcode
    // client_id:102789,
    // client_secret:"d17d647732566432b40064d5000800ac5a4e3929",
    // code:authcode,
    // grant_type:"authorization_code"}
    )
}

async function getActivityPage(idx, tok) { // returns activity page promise
    return $.get({ //request for activity list
                url:"https://www.strava.com/api/v3/athlete/activities",
                headers:{Authorization: "Bearer " + tok},
                data:{
                    per_page:ACTS_PER_PAGE, 
                    page:idx
                }
});
}

async function recordActivities(tok) {
    // start by setting up storage and iterator support
    sessionStorage.setItem("TotallyLostTempActs","[]");
    let curIdx = 1; //start with page 1
    let searchDone = false;
    let page = [];
    while (!searchDone) {
        //request next activity page, update page with progress
        logMessage("Requesting activity page " + curIdx + "...");
        page = await getActivityPage(curIdx,tok);
        logMessage("Activity page " + curIdx + " received.");
	console.log(page);
        logMessage("Reading activity page " + curIdx + "...");

        //if page is empty or we have a lot of activities, we're done
        console.log("doing page check")
	if (page.length == 0 || curIdx > NUM_PAGES) {
            searchDone = true;
            switch (page.length) {
                case 0: logMessage("Page is empty. Activity search complete.");
                default: logMessage("Already searched maximum of " + (NUM_PAGES * ACTS_PER_PAGE) + " activities. Search complete." )
            }
            break;
            }
        else { //otherwise, log it
            recordFromPage(page);
            logMessage("Activity page " + curIdx + " saved.");
            curIdx++; 
        }
    }
}

function recordFromPage(page) {
    // get current list
    let cur = JSON.parse(sessionStorage.getItem("TotallyLostTempActs"));
    // for all activities on page, append [activityId, mapId]
    // not using this rich infra YET because we only send an activity id to the next page, can use plain string
    for (const activity of page) { //note below: ignore activities under half a mile (and mapless)
        if (activity.map.summary_polyline != "" && activity.distance > 800) {
            cur.push([activity.id, activity.map.summary_polyline]);
        }
    }
    // update session storage. This might be slow? rewriting it for every page?
    // not going to bother investigating unless it feels bad when testing later.
    sessionStorage.setItem("TotallyLostTempActs",JSON.stringify(cur));
}

function logMessage(message) {
    $('#inprogress').after( '<p class="logentry">'+message+'</p>')
}
