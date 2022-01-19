

/*Visualize user data on page. Depending on passed props.type render them differenty. Defaultly use same rendering as in chat message*/
function VisualizeUser(user, type="default") {
    let element = document.createElement("div")
    switch (type) {
        case "large-popup":
            break;

        default:
            element.classList.add("user")
            let avatarElement = document.createElement("img")
            avatarElement.src = user.avatar
            let usernameP = document.createElement("p")
            usernameP.innerText = user.name
            element.appendChild(avatarElement)
            //element.appendChild(usernameP)
    }
    return element
}
function VisualizeChannel(channel, type="default") {
    let element = document.createElement("div")
    if (channel.id == null) {
        element.classList.add("error")
        element.innerText = "Channel not Found"
    } else {
        switch (type) {
            //Show server info in chat if linked to it.
            case "in-chat":
                element.classList.add("error")
                element.innerText = "Not implemented"
            default:

                element.classList.add("chat-component-channel")
                
                element.onclick = () => {
                    ActionMessagesOpen(channel.id)
                }
                let channelName = document.createElement("p")
                channelName.innerText = channel.name
                element.appendChild(channelName)
        }
    }
    return element;
}
function VisualizeServer(server, type="default") {
    let element = document.createElement("div")
    if (server.id == null) {
        element.classList.add("error")
        element.innerText = "Server not defined."
    } else {
        switch (type) {
            case "large-panel":
                break;

            //Show server info in chat if linked to it.
            case "in-chat":
                element.innerText = "Not implemented.";
                break;

            default:

                element.classList.add("chat-component-server");
                element.onclick = () => {
                    ActionServerOpen(server.id)
                }
                let serverIcon = document.createElement("img")
                serverIcon.src = server.icon
                element.appendChild(serverIcon)
        }
    }
    return element;
}

//Pass username message and avatar in props.
function VisualizeMessage(message, type="default") {
    //https://developer.mozilla.org/en-US/docs/Web/API/URL
    var parsed = parseMessage(message.content)
    content = parsed.content
    var element = document.createElement("div");
    element.classList.add("chat-component-message");
    element.setAttribute("data-message-id", message.id);

    if(message.author != null) {
        element.appendChild(VisualizeUser(message.author));
    }


    switch (type) {
        //System message in chat.
        case "chat-system":
            messageContent.innerHTML = content;
            break;
        default:

            var contentElement = document.createElement("div");

            var textElement = document.createElement("p")
            textElement.innerHTML = content;
            contentElement.appendChild(textElement);
            
            if (parsed.holder != null) {
                contentElement.appendChild(parsed.holder)
            }
            element.appendChild(contentElement);
            break;
    }

    return element
}