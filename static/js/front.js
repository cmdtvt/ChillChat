/*Javascript for the landing page*/


document.addEventListener('DOMContentLoaded',function() {
    console.log("Front script");

    document.querySelector("#login-button").addEventListener('click',function(){
        let element = document.querySelector("#login-box")
        element.classList.add("login-visible")
        element.classList.remove("login-hidden")
    });

    document.querySelector("#login-close").addEventListener('click',function(){
        console.log("closing")
        let element = document.querySelector("#login-box")
        element.classList.add("login-hidden")
        element.classList.remove("login-visible")
    });   
});
