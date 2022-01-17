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
    if(url != null) {
        let messages = await fetch(`${url}/channel/${channel}/messages`);
        if (messages.status == 200) {
            return await messages.json()
        } else {
            throw `API returned ${messages.status}`
        }
    } else {
        throw "API url is null"
    }
}