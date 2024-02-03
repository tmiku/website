$( document ).ready( function() {
    $('#privcheck').change(function() {
        if ($(this).is(':checked')) {
            $("#buttonlink").attr("href","https://www.strava.com/oauth/authorize?client_id=102789&response_type=code&scope=activity:read_all&redirect_uri="+window.location.origin+"%2Fgetlost%2Fpostauth.html")} else {
            $("#buttonlink").attr("href","https://www.strava.com/oauth/authorize?client_id=102789&response_type=code&scope=activity:read&redirect_uri="+window.location.origin+"%2Fgetlost%2Fpostauth.html")
        }
    })
}
)