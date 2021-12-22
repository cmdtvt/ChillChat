var data = new Map();
var settings = new Object();
settings["baseurl"] = "127.0.0.1:5000/v1";
settings["api"] = `http://${settings["baseurl"]}`;
settings["gateway"] = `ws://${settings["baseurl"]}/gateway/`;
settings["userid"] = null;
settings["current_channel"] = null;
settings["current_server"] = null;
settings["channel_list_open"] = false;
settings['chatIsScrolledBottom'] = false;


//TODO: Move these to seperate file
function isValidUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

//Check the correct embed for a link.
function parseMessage(message) {
    //var extension = message.split(/[#?]/)[0].split('.').pop().trim();
    var photoRegex = /(?:\b(?:https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]).(?:jpg|jpeg|gif|png)/ig
    var videoRegex = /(?:\b(?:https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]).(?<extension>webm|mp4)/ig
    var linkRegex = /(?:\b(?:https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*)/ig
    //photoregex return array of regex matches, where the element is represented with array with only one element
    //videoregex returns the same kind, but has 2 elements, one for extension
    var photolinks = [...message.matchAll(photoRegex)]
    var videolinks = [...message.matchAll(videoRegex)]
    var links = [...message.matchAll(linkRegex)]
    var content = message
    
    for(var x of new Set(links)) {
        content = content.replace(x, `<a href="${x}" target="_blank">${x}</a>`)
    }
    console.log(photolinks)
    console.log(videolinks)
    if(photolinks.length > 0 || videolinks.length > 0) {
        var holderElement = document.createElement("div")
        holderElement.classList.add("chat-embed-content")
        for(var x of photolinks) {
            console.log(x)
            var ele = document.createElement("img")
            ele.onerror = () => {
                ActionFailedLinkLoad(this)
            }
            ele.src = x[0] 
            holderElement.appendChild(ele)
        }
        for(var x of videolinks) {
            console.log(x)
            var ele = document.createElement("video")
            ele.controls = true
            ele.onerror = () => {
                ActionFailedLinkLoad(this)
            }
            var source = document.createElement("source")
            source.src = x[0] //url of the vid
            source.type = `video/${x[1]}` //x[1] is the extension
            ele.appendChild(source)
            holderElement.appendChild(ele)
        }
        return {holder: holderElement, content: content}
    } else {
        return {holder: null, content: content};
    }
    // var html = "";
    // switch (extension) {
    //     case "mp4":
    //         html = `
    //             <video width="400" controls onerror=ActionFailedLinkLoad(this)>
    //                 <source src="${message}" type="video/mp4">
    //             </video>`
    //         break;

    //     //Im using the case fallthrough here if this looks bit weird.
    //     case "png":
    //     case "jpg":
    //     case "jpeg":
    //     case "gif":
    //         html = `
    //             <img src="${message}" onerror=ActionFailedLinkLoad(this);>
    //         `;
    //         break;

    //     default:
    //         html = `<a href="${message}" target="_blank">${message}</a>`;
    //         break;
    // }
    // return html;

}

//#############################################

document.addEventListener("DOMContentLoaded", async function(event) {
    async function initialize() {
        //Get all messages from the currently open channel and caches them to server map entry.
        // var updateMessages = async() => {
        //     var fetch_it = await fetch(`${settings['api']}/channel/${settings["current_channel"]}/messages`);
        //     fetch_it = await fetch_it.json();
        //     var currentData = data.get(settings["current_server"])
        //     currentData.channels.get(settings["current_channel"]).messages = fetch_it
        // }
    //TURHA ? Toimii ilmankin


        //websocket creation, restarts itself if ws closes, the way we receive data from server, such as new messages, channel/server updates etc
        var createWebsocket = async() => {
            sock = new WebSocket(settings["gateway"]);
            sock.onopen = async () => {
                sock.send(`START`);
                console.log("Socket started!");
            }
    
            sock.onmessage = async (event) => {
                if (event.data == "HEARTBEAT") {
                    sock.send("ACK_HEARTBEAT");
                    console.log("Acknowledging heartbeat");
                } else {

                    let parsed = JSON.parse(event.data);
                    if (parsed.type == "member_data") {
                        settings["userid"] = parsed.payload.id
                        var servers = parsed.payload.servers
                        if(servers) {
                            settings['current_server'] = servers[0].id
                        }
                        for (var server of servers) {
                            server.channels = new Map()
                            var channels = await fetch(`${settings["api"]}/server/${server.id}/channels`);
                            channels = await channels.json();
                            for(var channel in channels) {
                                channel = channels[channel]
                                channel.messages = []
                                server.channels.set(channel.id, channel)
                            }
                            data.set(server.id, server)
                        }
                        //await updateMessages();
                        Servers();
                    } else if(parsed.type == "message") {
                        if(parsed.action == "new") {
                            ActionRenderNewMessage(parsed.payload)
                        }
                    }
                    console.log("New message");
                    console.log(parsed);
                    /*TODO: Handle different incoming data from the socket.
                    Not everything is always just messages.*/
                    //messages.list.push(parsed)
                    //data.set("messages",data.get("messages").push(parsed));
                    console.log(data.get("messages"));
                    
                }
            }
            sock.onclose = async () => {
                await createWebsocket()
            }
        }


    
    
    
        await createWebsocket(); 
        
    }
    await initialize();

    document.querySelector("#chat-input").addEventListener("keydown",async function(event){


        if(event.key == "Enter") {
            const handleKeyDown = async (event) => {
                let formData = new FormData();
                formData.append('message', this.value)
                await fetch(`${settings["api"]}/channel/${settings["current_channel"]}/message`, {
                    method: 'post',
                    body: formData
                })
            }
            await handleKeyDown();
            this.value = ""; 
            return false;
        }
        
    });


    document.querySelector("#message-area").addEventListener('wheel', function(event){
        if(findScrollDir(event)) {
            settings['chatIsScrolledBottom'] = true;
        } else {
            settings['chatIsScrolledBottom'] = false;
        }
        console.log(settings['chatIsScrolledBottom']);
    });
    
    //Returns true of scrolling up. false if down.
    function findScrollDir(event){
        var delta;
        if (event.wheelDelta){delta = event.wheelDelta;
        } else{delta = -1 *event.deltaY;}

        if (delta < 0){
            return false;
        }else if (delta > 0){
            return true;
            
        }
    }

    
});
    
    
    /*Visualize user data on page. Depending on passed props.type render them differenty. Defaultly use same rendering as in chat message*/
    function VisualizeUser(username,avatar,type=null) {
        switch (type) {
            case "large-popup":
                break;
            default:
                return(`
                    <div class="component-visualize-user-chat">
                        <img src=${avatar}></img>
                        <p>${username}</p>
                    </div>
                `);
                break;
        }
    }
    
    //Give server id and element id where channels are placed.
    function Channels(serverid,anchorid="#channels") {
        element = document.querySelector(anchorid);
        var temp = "";
        for (let [key,value] of data.get(serverid)['channels'].entries()) {
            temp += VisualizeChannel(null,value.id,value['name']);
        }
        element.innerHTML = temp;
    }

    function VisualizeChannel(type=null,id=null,name=null) {
        if(id==null) {
            return "Channel not defined";
        }

        switch (type) {
            //Show server info in chat if linked to it.
            case "in-chat":
                return(`<div>Not implemented.</div>`);
    
            default:
                return(`
                    <div class="component-visualize-channel-sidebar" onclick="ActionMessagesOpen(${id});">
                        <p>${name}</p>
                    </div>  
                `);
        }
    }

    function Servers(anchorid="#servers"){
        element = document.querySelector(anchorid); 
        var temp = "";
        for (let value of data.values()) {
             temp += VisualizeServer(null,value.id,value['icon']);
        }   
        element.innerHTML = temp;
    }
    
    
    function VisualizeServer(type=null,id=null,icon="https://via.placeholder.com/50x50") {
        if(id==null) {
            return "Server not defined";
        }
        switch (type) {
            case "large-panel":
                break;
    
            //Show server info in chat if linked to it.
            case "in-chat":
                return(`
                    <div>Not implemented.</div>
                `);
    
            default:
                return(`
                    <div class="component-visualize-server-sidebar" onclick="ActionServerOpen(${id});">
                        <img src="${icon}"></img> 
                    </div>  
                `);
        }
    }


    //Pass username message and avatar in props.
    function VisualizeMessage(author=null,messageID=null,content=null,type=null) {
        //https://developer.mozilla.org/en-US/docs/Web/API/URL
        var parsed = parseMessage(content)
        content = parsed.content
        var message = document.createElement("div")
        message.classList.add("component-message")
        message.setAttribute("data-message-id", messageID)
        if(type == "chat-system") {
            message.setAttribute("data-user-id", author['id'])
        }
        switch (type) {
            //System message in chat.
            case "chat-system":
                message.innerHTML= `<p class="message">${content}</p>`
                break; 
            default:
                message.innerHTML=`
                        ${VisualizeUser(author['name'],author['avatar'])}
                        <p class="message">${content}</p>
                    </div>
                `
                break;
        }
        if(parsed.holder != null) {
            message.appendChild(parsed.holder)
        }
        return message
    }

//Give element id where loading animation is added.
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

function ActionFailedLinkLoad(element) {
    element.parentElement.innerHTML = '<a href="'+element.src+'" target="_blank">'+element.src+'</a>';
}

function ActionRenderNewMessage(message) {
    var element = VisualizeMessage(message['author'],message['id'],message['content']);
    document.querySelector("#chat-bottom").insertAdjacentHTML('beforebegin', element.outerHTML)
    ActionScroll("#message-area","#chat-bottom","intoview");
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
                    console.log("yeet");
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
    var fetchMessages = async(messages) => {
        var fetch_messages = await fetch(`${settings['api']}/channel/${settings["current_channel"]}/messages`);
        if(fetch_messages.status == 200) {
            fetch_messages = await fetch_messages.json();
            for(const message in fetch_messages) {
                messages.push(fetch_messages[message]);
            }
            return true;
        }
        return false;
    }
    
    //If channel has no messages display a message about it.
    //TODO: Move fetching new messages away from here.
    var visualize = () => {
        for (const m in messages) {
            var temp = messages[m];
            element.appendChild(VisualizeMessage(temp['author'],temp['id'],temp['content']));
        }

        if(!messages) {
            element.appendChild(VisualizeMessage(cauthor=null,messageID=null,content="No messages",type="chat-system"));
        }

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
    if(messages.length == 0) { 
        fetchMessages(messages).then(visualize);
    } else {
        visualize()
    }

    


    
    

}

