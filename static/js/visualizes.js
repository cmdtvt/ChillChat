

/*Visualize user data on page. Depending on passed props.type render them differenty. Defaultly use same rendering as in chat message*/
function VisualizeUser(username, avatar, type = null) {
    let element = document.createElement("div")
    switch (type) {
        case "large-popup":
            break;

        default:
            element.classList.add("component-visualize-user-chat")
            let avatarElement = document.createElement("img")
            avatarElement.src = avatar
            let usernameP = document.createElement("p")
            usernameP.innerText = username
            element.appendChild(avatarElement)
            element.appendChild(usernameP)
    }
    return element
}
function VisualizeChannel(type = null, id = null, name = null) {
    let element = document.createElement("div")
    if (id == null) {
        element.classList.add("error")
        element.innerText = "Channel not Found"
    } else {
        switch (type) {
            //Show server info in chat if linked to it.
            case "in-chat":
                element.classList.add("error")
                element.innerText = "Not implemented"
            default:
                element.classList.add("component-visualize-channel-sidebar")
                element.onclick = () => {
                    ActionMessagesOpen(id)
                }
                let serverName = document.createElement("p")
                serverName.innerText = name
                element.appendChild(serverName)
        }
    }
    return element
}
function VisualizeServer(type = null, id = null, icon = "https://via.placeholder.com/50x50") {
    let element = document.createElement("div")
    if (id == null) {
        element.classList.add("error")
        element.innerText = "Server not defined."
    } else {
        switch (type) {
            case "large-panel":
                break;

            //Show server info in chat if linked to it.
            case "in-chat":
                element.innerText = "Not implemented."

            default:
                element.classList.add("component-visualize-server-sidebar")
                element.onclick = () => {
                    ActionServerOpen(id)
                }
                let serverIcon = document.createElement("img")
                serverIcon.src = icon
                element.appendChild(serverIcon)
        }
    }
    return element
}
//Pass username message and avatar in props.
function VisualizeMessage(author = null, messageID = null, content = null, type = null) {
    //https://developer.mozilla.org/en-US/docs/Web/API/URL
    var parsed = parseMessage(content)
    content = parsed.content
    var message = document.createElement("div")
    message.classList.add("component-message")
    message.setAttribute("data-message-id", messageID)
    if (type == "chat-system") {
        message.setAttribute("data-user-id", author['id'])
    }
    let messageContent = document.createElement("p")
    messageContent.classList.add("message")
    switch (type) {
        //System message in chat.
        case "chat-system":
            messageContent.innerHTML = content
            break;
        default:
            messageContent.innerHTML = content
            message.appendChild(VisualizeUser(author['name'], author['avatar']))
            break;
    }
    message.appendChild(messageContent)
    if (parsed.holder != null) {
        message.appendChild(parsed.holder)
    }
    return message
}