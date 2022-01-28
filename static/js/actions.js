function ActionLoadingAnimation(id) {
    var element = document.querySelector(id);
    //element.innerHTML = '<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
}

//Toggle element visibility on off with display:none;
//Return true if was made visible false if hidden
function ActionToggleVisibility(id,displayMode="block",mode=null) {
    let element = document.querySelector(id);
    let display = element.style.display;
    if (mode == null) {
        if(display == "none") {
            element.style.display = displayMode;
            return true;
        } else {
            element.style.display = "none";
            return false;
        }
    }

    if(mode=="show") {
        element.style.display = displayMode;
        return true;
    } else {
        element.style.display = "none";
        return false;
    }
}

//Get content = rendered data, type = how is rendered.
function ActionModalOpen(content,type=null) {
    switch (type) {
        case "image":
            document.querySelector("#modal-content").innerHTML = `<img src="${content}">`;
            
            break;

        case "video":
            break;
    
        default:
            console.log("Error in opening modal type not defined.");
            break;
    }
    ActionToggleVisibility("#modal");
}


function ActionRenderNewMessage(message) {
    var element = VisualizeMessage(message);
    if(message.channel.id == settings.current_channel) {
        document.querySelector("#message-area").insertBefore(element, document.querySelector("#chat-bottom"))
    }
    ActionScroll("#message-area","#chat-bottom","intoview-ifbottom", 300);
    return element
}
function ActionScroll(anchor=null,scrollto=null,behavior=null,scrollDelay=500){
    var element = document.querySelector(anchor);
    var scrollTo = document.querySelector(scrollto);
    setTimeout(() => {
        switch (behavior) {
            case "intoview":
                scrollTo.scrollIntoView({ behavior: "smooth" });
                break;

            case "intoview-ifbottom":
                if (settings['chatIsScrolledBottom']) {
                    scrollTo.scrollIntoView({ behavior: "smooth" });
                }
                break;
        
            default:
                console.log("Scroll behavior was not set.")
                break;
        }
    }, scrollDelay);


}

//Open server
function ActionServerOpen(server) {
    settings["current_server"] = server.id;
    ActionLoadingAnimation("#channels");
    //console.log(server)
    Channels(server); //FIXME: Change to use server not id 
    //SetupSettingsMenus(server);
}

//Prepare all setting menu forms etc...
function SetupSettingsMenus(server) {



    let element = document.querySelector("#settings-channels");
    for (let [key,value] of data.get(serverid)['channels'].entries()) {
        element.appendChild(VisualizeChannel(value));
    }
}
//Display messages by channel and server id
function ActionMessagesOpen(channel) {

    settings.current_channel = channel.id

    ActionLoadingAnimation("#message-area");
    let element = document.querySelector("#message-area");
    let server = data.get(settings['current_server']);
    let messages = channel['messages'];

    //Fetch messages from channel and store them in given array.
    killChildren(element)
    var createMessagesDOM = async(messages) => {
        try {
            if(!channel.fetched) {
                let fetch_messages = await fetchMessages(settings.current_channel)
                if(fetch_messages) {
                    for(let message of fetch_messages) {
                        var temp = fetch_messages[message]
                        var ele = VisualizeMessage(message)
                        element.appendChild(ele);
                        messages.set(message.id, [message, ele]);
                    }
                }
            } else {
                for(let [id, messageArr] of messages.entries()) {
                    let [message, ele] = messageArr
                    element.appendChild(ele);
                }
            }
        } catch (error) {
            console.log(error)
        }

        //This element is used to atomaticly scroll to the bottom of the chat area.
        let bottomArea = document.createElement("div")
        bottomArea.classList.add("component-message")
        bottomArea.id = "chat-bottom"
        element.appendChild(bottomArea);

        /*Scroll into end after some time because images take time to load.*/
        setTimeout(() => {
            bottomArea.scrollIntoView({ behavior: "smooth" });
        }, 800);
    }
    createMessagesDOM(messages);
    ActionToggleVisibility("#chat-textarea","flex","show");
}


