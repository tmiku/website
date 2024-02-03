// note: need to change input from "submit" to just "button"!!
// also need to add #status to html/css

$(() => {
    var startTime = new Date().valueOf();
    $("#submit").on("click", () => {
        var loadedSeconds = (new Date().valueOf() - startTime) / 1000;
        if (loadedSeconds <= 5.0) {window.location.reload(); return;}
        
        let formMessage = $("#messagefield").val();
        let formEmail = $("#emailfield").val();
        let formPass = $("input[name='password']").val();
        
        if (formMessage == "" || formEmail == "") {alert("Please fill out both boxes and try again."); return;}
        if (!validateEmail(formEmail)) {alert("Please try again with a valid email address."); return;}
        if (formPass != "") {alert("Something isn't right. Refresh and try again, and if this keeps happening text me or something."); return;}
        
	dateStr = new Date().toString()
        body = JSON.stringify({email: formEmail, ["text"]: formMessage, date: dateStr})

        $.post(window.location.origin+"/mikuserv/contact",
        body, //data
        (data, textStatus, jqXHR) => {alert("Message sent, thank you!") //success handler
        $("#messagefield").val('')
        $("#emailfield").val('')
        }
        ).fail((jqXHR, textStatus, errorThrown) => {alert("Failed with error: " + errorThrown)})
        }
        )
    
    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    }
}
)
