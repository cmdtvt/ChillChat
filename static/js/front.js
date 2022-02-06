/*Javascript for the landing page*/


document.addEventListener('DOMContentLoaded',function() {
    console.log("Front script");
    let hideLoginForm = () => {
        console.log("closing")
        let element = document.querySelector("#login-box")
        element.classList.remove("login-visible")
        element.classList.add("login-hidden")
    }
    let showLoginForm = () => {
        let element = document.querySelector("#login-box")
        element.classList.remove("login-hidden")
        element.classList.add("login-visible")
    }
    document.querySelector("#login-open").addEventListener('click',showLoginForm);

    document.querySelector("#login-close").addEventListener('click',hideLoginForm);

    let UpdateUI = (loginData) => {
        if(loginData !== undefined) {
            document.querySelectorAll(".not-logged-in").forEach(
                (e) => {
                    e.style.display = "none"
                }
            )
            document.querySelectorAll(".logged-in").forEach(
                (e) => {
                    e.style.display = "flex"
                }
            )
 
            let loggedInAs = document.querySelector("#logged-in-as")
            loggedInAs.innerText = `Logged in as ${loginData.name}`
        } else {
            document.querySelectorAll(".not-logged-in").forEach(
                (e) => {
                    e.style.display = "flex"
                }
            )
            document.querySelectorAll(".logged-in").forEach(
                (e) => {
                    e.style.display = "none"
                }
            )
            let loggedInAs = document.querySelector("#logged-in-as")
            loggedInAs.innerText = ""
        }
    }
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
                let loginData = await loginRequest.json()
                UpdateUI(loginData)
                let dateNow = Date.now()
                loginData.timestamp = dateNow
                localStorage.setItem('member', JSON.stringify(loginData))
                hideLoginForm()

            }
        }
    }
    let logout = document.querySelector("#logout")
    logout.onclick = async () => {
        let logoutRequest = await fetch(
            "/logout"
        )
        if(logoutRequest.status == 200) {
            UpdateUI()
            localStorage.removeItem('member')
        }
    }
    let initial = () => {
        let loginData = localStorage.getItem('member')
        console.log(loginData)
        
        if(loginData) {
            loginData = JSON.parse(loginData)
            let dateNow = Date.now()
            if(dateNow-loginData.timestamp < 86400000) {
                UpdateUI(loginData)
            } else {
                localStorage.removeItem('member')
            }
        } else {
            localStorage.removeItem('member')
        }

    }
    initial()
});
