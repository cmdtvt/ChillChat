handleMemberData = async (parsed, settings, wsFunc) => {
    let {serverFunc, renderComponentsFunc} = wsFunc
    settings.userData = parsed.payload;
    var servers = parsed.payload.servers
    if(servers) {
        settings['current_server'] = servers[0].id
    }
    for (let server of servers) {
        server.channels = new Map()
        var channels = await fetchChannels(server, settings.api)
        for(var channel in channels) {
            channel = channels[channel]
            channel.messages = new Map()
            channel.isFetched = false
            server.channels.set(channel.id, channel)
        }
        data.set(server.id, server)
    }
    //await updateMessages();
    serverFunc();
    renderComponentsFunc()

}
handleMessages = (parsed) => {
    if(parsed.action == "new") {
        console.log(parsed.payload)
        let messages = data.get(parsed.payload.server.id).channels.get(parsed.payload.channel.id).messages;
        messages.set(parsed.payload.id, [parsed.payload,ActionRenderNewMessage(parsed.payload)])
    } else if(parsed.action == "modify") {
        let messages = data.get(parsed.payload.server.id).channels.get(parsed.payload.channel.id).messages;
        let [message, elem] = messages.get(parsed.payload.id)
        let {holder, content} = parseMessage(parsed.payload.content)
        let contentElement = elem.querySelector("div.content")
        let textElement = contentElement.querySelector("p")
        textElement.innerHTML = content
        killChildren(contentElement)
        contentElement.appendChild(textElement)
        console.log(content, holder, contentElement, textElement)
        if(holder != null) {
            contentElement.appendChild(holder)
        }
        
    } else if(parsed.action == "remove") {
        let messages = data.get(parsed.payload.server.id).channels.get(parsed.payload.channel.id).messages;
        let [message, elem] = messages.get(parsed.payload.id)
        elem.parentNode.removeChild(elem)
        messages.delete(parsed.payload.id)

    }
}
handleChannels = (parsed, settings) => {
    if(parsed.action == "new") {
        let channels = data.get(parsed.payload.server.id).channels
        parsed.payload.messages = new Map()
        channels.set(parsed.payload.id, parsed.payload)
        if(settings['current_server'] == parsed.payload.server.id) {
            ActionServerOpen(settings['current_server'])
        }
    }
}
handleServers = (parsed, settings, data, wsFunc) => {
    if(parsed.action == "new") {
        settings["current_server"] = parsed.payload.id
        parsed.payload.channels = new Map()
        data.set(parsed.payload.id, parsed.payload)
        wsFunc()
    }
}
async function createWebsocket(wsFunc, data, settings) {
    if(settings) {
        let {serverFunc, renderComponentsFunc} = wsFunc
        let sock = new WebSocket(settings["gateway"]);
        sock.onopen = async () => {
            sock.send(`START`);
            console.log("Socket started!");
        }

        sock.onmessage = async (event) => {
            if (event.data == "HEARTBEAT") {
                sock.send("ACK_HEARTBEAT");
                console.log("Acknowledging heartbeat");
            } else {
                
                console.log("New message");
                console.log(event.data)
                let parsed = JSON.parse(event.data);
                if (parsed.type == "member_data") {
                    handleMemberData(parsed, settings, wsFunc)
                } else if (parsed.type == "message") {
                    handleMessages(parsed)
                } else if (parsed.type == "channel") {
                    handleChannels(parsed, settings)
                } else if(parsed.type == "server") {
                    handleServers(parsed, settings, data, serverFunc)
                }
                console.log(parsed);
                /*TODO: Handle different incoming data from the socket.
                Not everything is always just messages.*/
                //messages.list.push(parsed)
                //data.set("messages",data.get("messages").push(parsed));
                
            }
        }
        sock.onclose = async () => {
            await createWebsocket(wsFunc, data, settings)
        }
    }
}