var data = new Map();
var settings = new Object();
settings["baseurl"] = "127.0.0.1:5000/v1/";
settings["gateway"] = "http://"+settings["baseurl"];
settings["websocket"] = "ws://"+settings["baseurl"]+"gateway/";
settings["userid"] = null;
settings["current_channel"] = 2;
settings["current_server"] = 0;
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
function processUrl(link) {
    var extension = link.split(/[#?]/)[0].split('.').pop().trim();
    var photoRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]).(?:jpg|gif|png)/ig

    var html = "";
    switch (extension) {
        case "mp4":
            html = `
                <video width="400" controls onerror=ActionFailedLinkLoad(this)>
                    <source src="${link}" type="video/mp4">
                </video>`
            break;

        //Im using the case fallthrough here if this looks bit weird.
        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
            html = `
                <img src="${link}" onerror=ActionFailedLinkLoad(this);>
            `;
            break;

        default:
            html = `<a href="${link}" target="_blank">${link}</a>`;
            break;
    }
    return html;

}

//#############################################

document.addEventListener("DOMContentLoaded", function(event) {
    function initialize() {
        //Get all messages from the currently open server.
        //Identified by settings["current_server"]
        var updateMessages = async() => {
            var fetch_it = await fetch(settings['gateway']+"/channel/"+settings["current_channel"]+"/messages");
            fetch_it = await fetch_it.json();
            data.set(settings["current_server"],fetch_it);
        }

        //Get all servers and their channels.
        // var updateServers = async() => {

            
        //     var fetch_it = await fetch(settings["gateway"]+'/member/'+settings["userid"]+'/servers');
        //     temp = await fetch_it.json();
        //     for (const server in temp) {
        //         s = temp[server];
        //         s.channels = new Map();


        //         //Get server's channels and add them to the server object.
        //         var fetch_channels = await fetch(settings["gateway"]+'server/'+s.id+'/channels');
        //         temp_channels = await fetch_channels.json();
        //         for (const channel in temp_channels) {
        //             temp_channels[channel].messages = [];
        //             s.channels.set(temp_channels[channel].id,temp_channels[channel]);
                    
        //         }
        //         data.set(s.id,s) 
        //     }
        //     console.log(data);
        //     updateMessages();
        //     Servers();
        // };
    
        var createWebsocket = async() => {
            sock = new WebSocket(settings["websocket"]);
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
                        for (var server of servers) {
                            server.channels = new Map()
                            var channels = await fetch(`${settings["gateway"]}server/${server.id}/channels`);
                            channels = await channels.json();
                            for(var channel in channels) {
                                channel = channels[channel]
                                channel.messages = []
                                server.channels.set(channel.id, channel)
                            }
                            data.set(server.id, server)
                        }
                        updateMessages();
                        Servers();
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


    
    
    
        //TODO: Clean these up.
        createWebsocket(); 
        // updateServers();
        //Message first time update is done in updateServers because async reasons.
        
    }
    initialize();

    document.querySelector("#chat-input").addEventListener("keydown",function(event){


        if(event.key == "Enter") {
            const handleKeyDown = async (event) => {
                let formData = new FormData();
                formData.append('message', this.value)
                await fetch(settings["gateway"]+"/channel/"+settings["current_channel"]+"/message", {
                    method: 'post',
                    body: formData
                })
            }
            handleKeyDown();
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

        var isUrl = isValidUrl(content)
        if(!isUrl == false) {
            content = content.replace(content,processUrl(content));
            type = "chat-embed";
        }

        switch (type) {
            //System message in chat.
            case "chat-system":
                return(`
                    <div class="component-message">
                        <p class="message">${content}</p>
                    </div>
                `);

            case "chat-embed":
                return(`
                    <div class="component-message chat-embed" data-user-id=${author['id']} data-message-id=${messageID}>
                        ${VisualizeUser(author['name'],author['avatar'])}
                        <div class="chat-embed-content">${content}</div>
                    </div>
                `);    

            default:
                return(`
                    <div class="component-message" data-user-id=${author['id']} data-message-id=${messageID}>
                        ${VisualizeUser(author['name'],author['avatar'])}
                        <p class="message">${content}</p>
                    </div>
                `);
        }
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
    var html = VisualizeMessage(message['author'],message['id'],message['content']);
    document.querySelector("#chat-bottom").insertAdjacentHTML('beforebegin', html)
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
        var fetch_messages = await fetch(`${settings['gateway']}/channel/${settings["current_channel"]}/messages`);
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
        var html = "";
        for (const m in messages) {
            var temp = messages[m];
            html += VisualizeMessage(temp['author'],temp['id'],temp['content']);
        }

        if(html.length == "0") {
            html += VisualizeMessage(cauthor=null,messageID=null,content="No messages",type="chat-system");
        }

        //This element is used to atomaticly scroll to the bottom of the chat area.
        html += '<div class="component-message" id="chat-bottom"></div>';
        element.innerHTML = html;
        
        /*Scroll to bottom when co messages are loaded.
        This needs to be delayed because images take time to load and javascript won't
        Know the true height of the div so scrolling fails partly*/
        var bottom = document.querySelector("#chat-bottom");
        setTimeout(() => {
            bottom.scrollIntoView({ behavior: "smooth" });
        }, 1000);
        
    }
    if(messages.length == 0) { 
        fetchMessages(messages).then(visualize);
    } else {
        visualize()
    }

    


    
    

}

