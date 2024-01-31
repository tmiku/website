$( document ).ready( function() {
    $('#privcheck').change(function() {
        if ($(this).is(':checked')) {
            $("#buttonlink").attr("href","https://www.strava.com/oauth/authorize?client_id=102789&response_type=code&scope=activity:read_all&redirect_uri=http://rpi.local%2Ftotallylost%2Fpostauth.html");
            console.log("checked")} else {
            $("#buttonlink").attr("href","https://www.strava.com/oauth/authorize?client_id=102789&response_type=code&scope=activity:read&redirect_uri=http://rpi.local%2Ftotallylost%2Fpostauth.html")
        }
    })
}
)