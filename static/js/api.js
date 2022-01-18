var sendMessage = async(channel, message, url=null) => {
    if(url != null) {
        let formData = new FormData()
        formData.append('message', message)
        await fetch(`${url}/channel/${channel}/message`, {
                        method: 'post',
                        body: formData
        })
    } else {
        throw "API url is null"
    }
}
var fetchMessages = async(channel, url=null) => {
    if(url == null) {
        throw "API url is null"
    }
    let messages = await fetch(`${url}/channel/${channel}/messages`);
    if (messages.status == 200) {
        return await messages.json()
    } else {
        throw `API returned ${messages.status}`
    }
}
var editMessage = async() => {

}
var fetchChannels = async(server, url=null) => {
    if(url == null) {
        throw "API url is null"
    }
    let channels = await fetch(`${url}/server/${server.id}/channels`);
    if(channels.status == 200) {
        return await channels.json()
    } else {
        throw `API returned ${channels.status}`
    }
}
var deleteMessage = async() => {

}
var createChannel = async() => {

}
var joinServer = async() => {

}
var createServer = async() => {

}