

/*Visualize user data on page. Depending on passed props.type render them differenty. Defaultly use same rendering as in chat message*/
function VisualizeUser(user, type="default") {
    let element = document.createElement("div");
    let avatarElement = document.createElement("img");
    avatarElement.src = user.avatar;
    let usernameP = document.createElement("p");
    usernameP.innerText = user.name;


    element.addEventListener("contextmenu",function(e){
        openContextMenu(e.clientX,e.clientY,"default",[user.name],{
            "Message" : () => {},
            "Invite" : () => {},
            "Kick" : () => {},
            "Dump User" : () => {console.log(user)},
            [user.id] : () => {}
        });
        e.preventDefault();
    });

    switch (type) {
        case "large-popup":

            break;

        case "channel-list":
            
            let userSettings = document.createElement("p");
            userSettings.classList.add("icon-settings");
            userSettings.setAttribute('data-pagetarget' , "#page-settings");
            element.classList.add("user");
            element.appendChild(avatarElement);
            element.appendChild(usernameP);
            element.appendChild(userSettings);
            break;

        default:
            element.classList.add("user");
            element.appendChild(avatarElement);
           // element.appendChild(usernameP);
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


                element.addEventListener("contextmenu",function(e){
                    openContextMenu(e.clientX,e.clientY,"default","Channel",{
                        "Settings" : () => {},
                        "Mute Channel" : () => {},
                        "Delete" : () => {},
                        "Dump Channel" : () => {console.log(channel)},
                        [channel.id] : () => {}
                    });
                    e.preventDefault();
                });

                element.classList.add("chat-channel")
                element.onclick = () => {
                    ActionMessagesOpen(channel)
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

                element.addEventListener("contextmenu",function(e){
                    openContextMenu(e.clientX,e.clientY,"default","Server",{
                        "Invite" : () => {},
                        "Mute Server" : () => {},
                        "Leave" : () => {},
                        "Dump Server" : () => {console.log(server)},
                        [server.id] : () => {}
                    });
                    e.preventDefault();
                });

                element.classList.add("chat-server");
                element.onclick = () => {
                    ActionServerOpen(server)
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
    var parsed = parseMessage(message.content)
    content = parsed.content
    var element = document.createElement("div");
    element.classList.add("chat-message");
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
            contentElement.addEventListener("contextmenu",function(e){
                openContextMenu(e.clientX,e.clientY,"default","Message", {
                    "Edit message" : () => {openMessageToEdit(message)},
                    "Delete message" : async () => {await deleteMessage(message)},
                    "Dump message" : () => {console.log(message)},
                    [message.id] : () => {}
                });
                e.preventDefault();
            });


            contentElement.classList.add("content")

            let messageinfo = document.createElement("div")
            messageinfo.classList.add("info")
            let username = document.createElement("p")
            username.classList.add("username")
            username.innerHTML = message.author.name


            if(message.timestamp != null) {
                let timestamp = document.createElement("p")
                timestamp.classList.add("timestamp")
                timestamp.innerHTML = message.timestamp
                messageinfo.appendChild(timestamp)
            }

            messageinfo.appendChild(username)
            
            contentElement.appendChild(messageinfo)


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