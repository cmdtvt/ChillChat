function ActionLoadingAnimation(id) {
    var element = document.querySelector(id);
    element.innerHTML = '<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
}

//Toggle element visibility on off with display:none;
function ActionToggleVisibility(id) {
    var element = document.querySelector(id);
    var display = element.style.display;
    if(display == "none") {
        element.style.display = "block";
    } else {
        element.style.display = "none";
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
    var element = VisualizeMessage(message['author'],message['id'],message['content']);
    document.querySelector("#chat-bottom").insertAdjacentHTML('beforebegin', element.outerHTML)
    ActionScroll("#message-area","#chat-bottom","intoview");
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
    if(!settings["channel_list_open"]) {
        ActionToggleVisibility("#channels");
        settings["channel_list_open"] = true;
    }
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
    var createMessagesDOM = async(messages) => {
        try {
            let fetch_messages = await fetchMessages(settings['current_channel'], settings['api'])
            if(fetch_messages) {
                for(const message in fetch_messages) {
                    var temp = fetch_messages[message]
                    var ele = VisualizeMessage(temp['author'],temp['id'],temp['content'])
                    element.appendChild(ele);
                    messages.set(temp['id'], ele);
                }
             } else {
                element.appendChild(VisualizeMessage(cauthor=null, messageID=null, content="No messages", type="chat-system"));
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
}
