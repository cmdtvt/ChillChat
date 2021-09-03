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