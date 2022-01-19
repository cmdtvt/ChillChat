handleMemberData = async (parsed, settings, wsFunc) => {
    settings["userid"] = parsed.payload.id
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
            server.channels.set(channel.id, channel)
        }
        data.set(server.id, server)
    }
    //await updateMessages();
    wsFunc();

}
handleMessages = (parsed) => {
    if(parsed.action == "new") {
        console.log(parsed.payload)
        let messages = data.get(parsed.payload.server.id).channels.get(parsed.payload.channel.id).messages;
        messages.set(parsed.payload.id, ActionRenderNewMessage(parsed.payload))
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
async function createWebsocket(wsFunc, data, settings) {
    console.trace(settings)
    if(settings) {
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

                let parsed = JSON.parse(event.data);
                if (parsed.type == "member_data") {
                    handleMemberData(parsed, settings, wsFunc)
                } else if (parsed.type == "message") {
                    handleMessages(parsed)
                } else if (parsed.type == "channel") {
                    handleChannels(parsed, settings)
                }
                console.log("New message");
                console.log(parsed);
                /*TODO: Handle different incoming data from the socket.
                Not everything is always just messages.*/
                //messages.list.push(parsed)
                //data.set("messages",data.get("messages").push(parsed));
                
            }
        }
        sock.onclose = async () => {
            await createWebsocket(wsFunc, data)
        }
    }
}