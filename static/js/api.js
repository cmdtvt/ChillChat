var sendMessage = async(channel, message) => {
    url = settings.api
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
var editMessage = async(message, content) => {
    url = settings.api
    if(url == null) {
        throw "API url is null"
    }
    let formData = new FormData()
    formData.append("content", content)
    await fetch(`${url}/message/${message.id}`, {
        method: 'patch',
        body: formData
    })
}
var deleteMessage = async(message) => {
    url = settings.api
    if(url == null) {
        throw "API url is null"
    }
    await fetch(`${url}/message/${message.id}`, {
        method: 'delete'
    })
}
var fetchMessages = async(channel) => {
    url = settings.api
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

var fetchChannels = async(server) => {
    url = settings["api"]
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

var createChannel = async(server, name, type="text") => {
    url = settings.api
    if(url == null) {
        throw "API url is null"
    }
    if(server == null) {
        throw "Server is null"
    }
    let formData = new FormData()
    formData.append("name", name)
    formData.append("type", type)
    await fetch(`${url}/server/${server.id}/channel`, {
        method: 'post',
        body: formData
    })
}
var joinServer = async(server) => {
    url = settings.api
    if(url == null) {
        throw "API url is null"
    }
    await fetch(`${url}/server/${server.id}/join`, {
        method: 'get'
    })
}
var leaveServer = async(server) => {
    url = settings.api
    if(url == null) {
        throw "API url is null"
    }
    await fetch(`${url}/server/${server.id}/leave`, {
        method: 'get'
    })
}
var createServer = async(name) => {
    url = settings.api
    if(url == null) {
        throw "API url is null"
    }
    let formData = new FormData()
    formData.append("name", name)
    await fetch(`${url}/server`, {
        method: 'post',
        body: formData
    })

}