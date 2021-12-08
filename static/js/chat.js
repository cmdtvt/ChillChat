console.log("Chat script loaded.");
var data = new Map();
var settings = new Object();
settings["gateway"] = "http://127.0.0.1:5000/v1/";
settings["userid"] = 3;
settings["current_channel"] = 2;
settings["current_server"] = 0;

document.addEventListener("DOMContentLoaded", function(event) { 
    function initialize() {

        //Get all servers the user is on and update the GUI
        var updateServers = async() => {
            var fetch_it = await fetch(settings["gateway"]+'/member/'+settings["userid"]+'/servers');
            data.set("servers",await fetch_it.json());
            Servers();
        };
        
        //Get all messages from the currently open server.
        //Identified by settings["current_server"]
        var updateMessages = async() => {
            var fetch_it = await fetch(settings['gateway']+"/channel/"+settings["current_channel"]+"/messages");
            fetch_it = await fetch_it.json();
            data.set("messages",fetch_it);
        }
    
    
        var createWebsocket = async() => {
            //FIXME: Make this gateway use gateway from settings.
            sock = new WebSocket(`ws://127.0.0.1:5000/v1/gateway/`);
            sock.onopen = async () => {
                sock.send(`START`);
            }
    
            sock.onmessage = async (event) => {
                if (event.data == "HEARTBEAT") {
                    sock.send("ACK_HEARTBEAT");
                    console.log("Acknowledging heartbeat");
                } else {
                    let parsed = JSON.parse(event.data);
                    console.log(parsed);
                    /*TODO: Handle different incoming data from the socket.
                    Not everything is always just messages.*/
                    //messages.list.push(parsed)
                }
            }
            sock.onclose = async () => {
                await createWebsocket()
            }
            sock.onerror = async () => {
                await createWebsocket()
            }
        }
    
    
    
        //TODO: Clean thse up.
        updateServers();
        updateMessages();
        createWebsocket();
        console.log(data);
    
    }
    initialize();
    
});  
    
    function Chat() {
        const handleKeyDown = async (event) => {
            if (event.key === 'Enter') {
                console.log("SENDING MESSAGE")
                let formData = new FormData();
                formData.append('message', event.target.value)
                event.target.value = "";
                await fetch(settings["gateway"]+"/channel/"+settings["current_channel"]+"/message", {
                    method: 'post',
                    body: formData
                })
            }
        }
    }
    
    
    /*Visualize user data on page. Depending on passed props.type render them differenty. Defaultly use same rendering as in chat message*/
    function VisualizeUser(username,avatar,type=null) {
        switch (type) {
            case "large-popup":
                break;
            default:
                return(`
                    <div className="component-visualize-user-chat">
                        <img src=${avatar}></img>
                        <span>${username}</span>
                    </div>
                `);
                break;
        }
    }
    
    
    function Servers(anchorid="#servers"){
        element = document.querySelector(anchorid);
        serverData = data.get("servers");
        console.log(serverData);

        for (const server in serverData) {
            element.innerHTML += VisualizeServer(null,server);
        }

        console.log(element);
    }
    
    
    function VisualizeServer(type=null,id=null,avatar="https://via.placeholder.com/50x50") {
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
                    <div className="component-visualize-server-sidebar" onclick="ActionServerOpen(${id});">
                        <img src="${avatar}"></img> 
                    </div>  
                `);
        }
    }


    //Pass username message and avatar in props.
    function VisualizeMessage(author,messageID,messageText) {
        return(`
            <div className="component-message" data-user-id=${author['id']} data-message-id=${messageID}>
                ${VisualizeUser(author['name'],author['avatar'])}
                <span>${messageText}</span>
            </div>
        `);
    }





function ActionServerOpen(id) {
    settings["current_server"] = id;
    ActionMessagesOpen(id); 
}

//Display messages by channel and server id
function ActionMessagesOpen(id) {
    element = document.querySelector("#chat");
    messageData = data.get("messages");

    for (const message in messageData) {
        temp = messageData[message];
        element.innerHTML += VisualizeMessage(temp['author'],temp['id'],temp['content'])
    }

    console.log(element); 
}
