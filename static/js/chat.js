console.log("Chat script loaded.");
var data = new Map();
var settings = new Object();
settings["gateway"] = "http://127.0.0.1:5000/v1/";
settings["userid"] = 3;
//Manage all fetched data.
function fetchManager(){

}

data.set("messages",new Map());


function initialize() {
    var updateServers = async() => {
        var fetch_it = await fetch(settings["gateway"]+'/member/'+settings["userid"]+'/servers');
        data.set("servers",await fetch_it.json());
        console.log(data);
    }
    updateServers();
}
initialize();

const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
        console.log("SENDING MESSAGE")
        let formData = new FormData();
        formData.append('message', event.target.value)
        event.target.value = ""
        await fetch(`http://${gateway}/channel/2/message`, {
            method: 'post',
            body: formData
        })
    }
}

/*Visualize user data on page. Depending on passed props.type render them differenty. Defaultly use same rendering as in chat message*/
function VisualizeUser(props) {
    switch (props.type) {
        case "large-popup":
            break;
        default:
            return(`
                <div className="component-visualize-user-chat">
                    <img src={props.avatar}></img>
                    <span>{props.username}</span>
                </div>
            `);
            break;
    }
}

function VisualizeServer(props) {
    switch (props.type) {
        case "large-panel":
            break;

        //Show server info in chat if linked to it.
        case "in-chat":
            return(`
                <div>Not implemented.</div>
            `);

        default:
            return(`
                <div className="component-visualize-server-sidebar">
                    <img src={props.avatar}></img> 
                </div>  
            `);
    }
}