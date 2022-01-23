const data = new Map();
const baseurl = "127.0.0.1:5000/v1"
var settings = {
    baseurl : "127.0.0.1:5000/v1",
    api : `http://${baseurl}`,
    gateway : `ws://${baseurl}/gateway/`,
    userData : null,
    current_server : null,
    current_channel : null,
    chatIsScrolledBottom : false
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
    var links = Array.from(message.matchAll(linkRegex), m => m[0])
    var content = message
    for(var x of new Set(links)) {

        content = content.replaceAll(x, `<a href="${x}" target="_blank">${x}</a>`)
    }

    if(photolinks.length > 0 || videolinks.length > 0) {
        var holderElement = document.createElement("div")
        holderElement.classList.add("chat-embed-content")
        for(var x of photolinks) {
            var ele = document.createElement("img")
            ele.onerror = () => {
                ele.style.display="none"
            }

            ele.onclick = () => {
                ActionModalOpen(x[0],"image");
            }

            ele.src = x[0] 
            holderElement.appendChild(ele)
        }
        for(var x of videolinks) {
            var ele = document.createElement("video")
            ele.controls = true
            ele.onerror = () => {
                ele.style.display="none"
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

}
document.addEventListener("DOMContentLoaded", async function(event) {
    async function initialize() {
        let functions = {serverFunc : Servers, renderComponentsFunc : RenderComponents}
        await createWebsocket(functions, data, settings); 
    }
    await initialize();


    document.querySelector("#chat-input").addEventListener("keydown",async function(event){
        if(event.key == "Enter") {
            const handleKeyDown = async (event) => {
                await sendMessage(settings["current_channel"], this.value)
            }
            await handleKeyDown();
            this.value = ""; 
            return false;
        }
    });

    //FIXME: Make button send message from textbox and clear it.
    //Currently does absolutely nothing.
    /*
    document.querySelector("#send-message").addEventListener("onclick",async function(event){
        const handleKeyDown = async (event) => {
            await sendMessage(settings["current_channel"], this.value, settings["api"])
        }
        await handleKeyDown();
        this.value = ""; 
        return false;  
    });
    */

    document.querySelector("#message-area").addEventListener('scroll', function(event){
        if(findScrollDir(event)) {
            settings['chatIsScrolledBottom'] = true;
        } else {
            settings['chatIsScrolledBottom'] = false;
        }
        console.log(settings['chatIsScrolledBottom']);
    });
});

//Give server id and element id where channels are placed.
function Channels(serverid,anchorid="#channels") {
    let element = document.querySelector(anchorid);
    killChildren(element)
    for (let [key,value] of data.get(serverid)['channels'].entries()) {
        element.appendChild(VisualizeChannel(value));
    }
}

function Servers(anchorid="#servers") {
    let element = document.querySelector(anchorid);
    killChildren(element)
    for (let value of data.values()) {
        element.appendChild(VisualizeServer(value));
    }
    ActionInterfaceSwitchPage("#page-chat");

}

//Render some components are needed only once.
function RenderComponents() {
    console.log("test "+settings.userData);
    let element = document.querySelector("#channels-wrapper")
    let second_element = element.querySelector("div.user")
    if (second_element != null) {

        element.removeChild(second_element)
    }
    element.appendChild(VisualizeUser(settings.userData, "channel-list"));

    //Make sure all interface buttons are registered.
    UtilityActionInterfaceReload();
}



