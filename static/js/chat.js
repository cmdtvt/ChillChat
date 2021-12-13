console.log("Chat script loaded.");
var data = new Map();
var settings = new Object();
settings["baseurl"] = "127.0.0.1:5000/v1/";
settings["gateway"] = "http://"+settings["baseurl"];
settings["websocket"] = "ws://"+settings["baseurl"]+"gateway/";
settings["userid"] = 3;
settings["current_channel"] = 2;
settings["current_server"] = 0;

document.addEventListener("DOMContentLoaded", function(event) { 
    function initialize() {

        
        //Get all messages from the currently open server.
        //Identified by settings["current_server"]
        var updateMessages = async() => {
            var fetch_it = await fetch(settings['gateway']+"/channel/"+settings["current_channel"]+"/messages");
            fetch_it = await fetch_it.json();
            data.set("messages",fetch_it);
            console.log(data.get("messages"));
        }

        //Get all servers and their channels.
        var updateServers = async() => {

            
            var fetch_it = await fetch(settings["gateway"]+'/member/'+settings["userid"]+'/servers');
            temp = await fetch_it.json();
            for (const server in temp) {
                s = temp[server];
                s.channels = new Map();


                //Get server's channels and add them to the server object.
                var fetch_channels = await fetch(settings["gateway"]+'server/'+s.id+'/channels');
                temp_channels = await fetch_channels.json();
                for (const channel in temp_channels) {
                    s.channels.set(temp_channels[channel].id,temp_channels[channel])
                }

                data.set(s.id,s) 
            }
            console.log(data);
            updateMessages();
            Servers();
        };
    
    
        var createWebsocket = async() => {
            sock = new WebSocket(settings["websocket"]);
            sock.onopen = async () => {
                sock.send(`START`);
            }
    
            sock.onmessage = async (event) => {
                if (event.data == "HEARTBEAT") {
                    sock.send("ACK_HEARTBEAT");
                    console.log("Acknowledging heartbeat");
                } else {
                    let parsed = JSON.parse(event.data);
                    console.log("New message");
                    console.log(parsed);
                    /*TODO: Handle different incoming data from the socket.
                    Not everything is always just messages.*/
                    //messages.list.push(parsed)
                    data.set("messages",data.get("messages").push(parsed));
                    console.log(data.get("messages"));
                    
                }
            }
            sock.onclose = async () => {
                await createWebsocket()
            }
        }
    
    
    
        //TODO: Clean these up.
        updateServers();
        //Message first time update is done in updateServers because async reasons.
        createWebsocket();
        ActionMessagesOpen(3);
        console.log(data);
    
    }
    initialize();



    document.querySelector("#chat-input").addEventListener("keydown",function(event){
        const handleKeyDown = async (event) => {
            let formData = new FormData();
            formData.append('message', this.value)
            await fetch(settings["gateway"]+"/channel/"+settings["current_channel"]+"/message", {
                method: 'post',
                body: formData
            })
        }

        if(event.key == "Enter") {
            handleKeyDown();
            this.value = ""; 
            return false;
        }
        
    });
    
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
                        <span>${username}</span>
                    </div>
                `);
                break;
        }
    }
    
    
    function Servers(anchorid="#servers"){
        console.log("SERVERS");
        element = document.querySelector(anchorid); 
        console.log(data);

        var temp = "";
        for (let value of data.values()) {
             temp += VisualizeServer(null,value,value['icon']);
        }
        
        element.innerHTML = temp;
        console.log(element);
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
    function VisualizeMessage(author,messageID,content) {
        return(`
            <div class="component-message" data-user-id=${author['id']} data-message-id=${messageID}>
                ${VisualizeUser(author['name'],author['avatar'])}
                <p class="message">${content}</p>
            </div>
        `);
    }





function ActionServerOpen(id) {
    settings["current_server"] = id;
    ActionMessagesOpen(id);
}

function ActionToggleChannelMenu() {

}

//Display messages by channel and server id
function ActionMessagesOpen(id) {
    var element = document.querySelector("#message-area");
    var messageData = data.get("messages");

    var html = "";
    for (const message in messageData) {
        var temp = messageData[message];
        html += VisualizeMessage(temp['author'],temp['id'],temp['content'])
    }
    //This element is used to atomaticly scroll to the bottom of the chat area.
    html += '<div class="component-message" id="chat-bottom"></div>';
    element.innerHTML = html;


    
    /*Scroll to bottom when co messages are loaded.
    This needs to be delayed because images take time to load and javascript wont
    Know to true height of the div so scroll fails*/

    var bottom = document.querySelector("#chat-bottom");
    setTimeout(() => {
        bottom.scrollIntoView({ behavior: "smooth" });
    }, 1000);

    console.log(element); 
}

