
$(document).on('keypress',function(e) {
    if(e.which == 229) {
        $("#devpanel").toggle();
    }
});

function convertUnixTimestampToDate(timestamp) {
    let dt = new Date(timestamp*1000);
    return dt
}

function convertDatetoFormat(dateObject) {
    let hours = dateObject.getHours();
    let minutes = dateObject.getMinutes();
    let seconds = dateObject.getSeconds();

    let day = dateObject.getDate();
    let month = dateObject.getMonth()+1;
    let year = dateObject.getFullYear()

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${day}.${month}.${year}`
    
}

function validateUrlImage(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

//Check if url has a image.
function checkUrlForImage(url, callback, timeout) {
    timeout = timeout || 5000;
    var timedOut = false, timer;
    var img = new Image();

    img.onerror = img.onabort = function() {
        if (!timedOut) {
            clearTimeout(timer);
            callback(url, "error");
        }
    };

    img.onload = function() {
        if (!timedOut) {
            clearTimeout(timer);
            callback(url, "success");
        }
    };
    
    img.src = url;
    timer = setTimeout(function() {
        timedOut = true;
        // reset .src to invalid URL so it stops previous
        // loading, but doesn't trigger new load
        img.src = "//!!!!/test.jpg";
        callback(url, "timeout");
    }, timeout); 
}