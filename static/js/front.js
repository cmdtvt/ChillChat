/*Javascript for the landing page*/


document.addEventListener('DOMContentLoaded',function() {
    console.log("Front script");

    document.querySelector("#login-open").addEventListener('click',function(){
        let element = document.querySelector("#login-box")
        element.classList.remove("login-hidden")
        element.classList.add("login-visible")
    });

    document.querySelector("#login-close").addEventListener('click',function(){
        console.log("closing")
        let element = document.querySelector("#login-box")
        element.classList.remove("login-visible")
        element.classList.add("login-hidden")
    });

    let login = document.querySelector("#login-form")
    login.onsubmit = async (e) => {
        e.preventDefault();
        let usernameInput = document.querySelector("#login-username")
        let passwordInput = document.querySelector("#login-password")
        if(usernameInput.value !== "" && passwordInput.value !== "") {
            let formData = new FormData()
            formData.append("username", usernameInput.value)
            formData.append("password", passwordInput.value)
            let loginRequest = await fetch(
                "/login",
                {
                    method: 'post',
                    body: formData
                }
            )
            if(loginRequest.status == 200) {
                // stuff when login
            }
        }

    }

});
