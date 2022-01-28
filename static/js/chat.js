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
    

    //Send message by pressing enter or by pressing send message button.
    document.querySelector("#chat-input").addEventListener("keydown",async function(event) {
        await sendMessageFromTextarea(event); 
    });
    document.querySelector("#send-message").addEventListener("click",async function(event){
        await sendMessageFromTextarea(event,"button");
    });

    async function sendMessageFromTextarea(event,type="textarea"){
        let textarea = document.querySelector("#chat-input")
        if(event.key == "Enter" || type=="button") {
            await sendMessage(settings["current_channel"], textarea.value, settings["api"])
            document.querySelector("#chat-input").value = ""
        }
        return false;  
    }

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
function Channels(server,anchorid="#channels") {

    let element = document.querySelector(anchorid);
    killChildren(element)
    for (let [key,channel] of server['channels'].entries()) {
        element.appendChild(VisualizeChannel(channel));
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

//TODO: Move this somewhere else maby.
function openMessageToEdit(message) {
    let element = document.querySelector("[data-message-id='"+message.id+"']");
    let stored_element = element.innerHTML;


    let content_wrapper = element.querySelector(".content p")
    content_wrapper.classList.add("hide")
    let content = content_wrapper.innerHTML

    let editor = document.createElement("div")
    let save = document.createElement("button")
    save.innerHTML = "Save"
    save.classList.add("btn")
    save.classList.add("btn-green")

    let cancel = document.createElement("button")
    cancel.innerHTML = "Cancel"
    cancel.classList.add("btn")
    cancel.classList.add("btn-green")
    let textarea = document.createElement("textarea")
    textarea.innerHTML = content
    textarea.setAttribute("id","message-editor")

    cancel.addEventListener("click",function(e) {
        element.innerHTML = stored_element;
    })

    save.addEventListener("click",function(e) {
        let text = document.querySelector("#message-editor").value
        editMessage(message,text);
        element.innerHTML = stored_element;
    })




    editor.appendChild(textarea)
    editor.appendChild(cancel)
    editor.appendChild(save)
    
    element.querySelector(".content").appendChild(editor)

}



