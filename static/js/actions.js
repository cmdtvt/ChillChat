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

function ActionFailedLinkLoad(element) {
    element.parentElement.innerHTML = '<a href="'+element.src+'" target="_blank">'+element.src+'</a>';
}

function ActionRenderNewMessage(message) {
    var element = VisualizeMessage(message);
    if(message.channel.id == settings.current_channel) {
        document.querySelector("#chat-bottom").insertAdjacentHTML('beforebegin', element.outerHTML)
    }
    ActionScroll("#message-area","#chat-bottom","intoview-ifbottom", 100);
    return element
}
function ActionScroll(anchor=null,scrollto=null,behavior=null,scrollDelay=500){
    console.log("Scrolling");
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
function ActionServerOpen(id) {
    settings["current_server"] = id;
    ActionLoadingAnimation("#channels");
    Channels(id);
}
//Display messages by channel and server id
function ActionMessagesOpen(id) {

    settings["current_channel"] = id;

    ActionLoadingAnimation("#message-area");
    var element = document.querySelector("#message-area");
    var server = data.get(settings['current_server']);
    var messages = server['channels'].get(id)['messages'];

    //TODO: Add a check if there are new messages.
    //Maby create a endpoint which returns the id of the newest message.

    //Fetch messages from channel and store them in given array.
    killChildren(element)
    var createMessagesDOM = async(messages) => {
        try {
            let fetch_messages = await fetchMessages(settings['current_channel'], settings['api'])
            if(fetch_messages) {
                for(let message of fetch_messages) {
                    var temp = fetch_messages[message]
                    var ele = VisualizeMessage(message)
                    element.appendChild(ele);
                    messages.set(message.id, ele);
                }
             } else {
                //element.appendChild(VisualizeMessage(message);
             }
        } catch (error) {
            console.log(error)
        }
    //If channel has no messages display a message about it.
    //TODO: Move fetching new messages away from here.
        //This element is used to atomaticly scroll to the bottom of the chat area.
        var bottomArea = document.createElement("div")
        bottomArea.classList.add("component-message")
        bottomArea.id = "chat-bottom"
        element.appendChild(bottomArea);
        /*Scroll to bottom when co messages are loaded.
        This needs to be delayed because images take time to load and javascript won't
        Know the true height of the div so scrolling fails partly*/
        setTimeout(() => {
            bottomArea.scrollIntoView({ behavior: "smooth" });
        }, 1000);
    }
    createMessagesDOM(messages);
    ActionToggleVisibility("#chat-textarea","flex","show");
}


