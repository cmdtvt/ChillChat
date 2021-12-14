const gateway = "127.0.0.1:5000/v1";
//"http://127.0.0.1:5000/v1/messages/2"
let sock;
var mainData = new Map();   

ReactDOM.render(
    <Servers mainData={mainData}/>,
    document.getElementById("servers")
);

ReactDOM.render(
    <Chat mainData={mainData}/>,
    document.getElementById("chat")
);

ReactDOM.render(
    <p>bööööp</p>,
    document.getElementById("contacts")
);


function Chat(props) {
    //const [isPaused, setPause] = useState(false);
    const [messages, setMessages] = React.useState({list : []});
    const [socket, setSocket] = React.useState(true)
    console.log(messages);
    // 
    var createWebsocket = async() => {
        sock = new WebSocket(`ws://${gateway}/gateway/`);
        sock.onopen = async () => {
            var fetch_it = await fetch(`http://${gateway}/channel/2/messages`)
            if(fetch_it.status == 200) {
                fetch_it = await fetch_it.json();
                var tmp = messages.list
                tmp.push(...fetch_it)
                setMessages({list : tmp})
                console.table(messages)
            }
            sock.send(`START`);
        }

        sock.onmessage = async (event) => {
            if (event.data == "HEARTBEAT") {
                sock.send("ACK_HEARTBEAT");
                console.log("Acknowledging heartbeat");
            } else {
                let parsed = JSON.parse(event.data)
                console.log(parsed)
                /*TODO: Handle different incoming data from the socket.
                Not everything is always just messages.*/
                messages.list.push(parsed)
                setMessages({list:messages.list})
                //llls(parsed)
            }
        }
        sock.onclose = async () => {
            await createWebsocket()
        }
        sock.onerror = async () => {
            await createWebsocket()
        }
    }

    React.useEffect(() => {
        
    }, [messages])

    React.useEffect(() => {
        createWebsocket().then()
    }, [socket])


    const handleKeyDown = async (event) => {
        if (event.key === 'Enter') {
            console.log("SENDING MESSAGE")
            let formData = new FormData();
            formData.append('message', event.target.value)
            event.target.value = ""
            await fetch(`http://${gateway}/channel/2/message`,
            {
                method: 'post',
                body: formData
            })
        }
    }

    return(
        
        <div className="component-chat">
            <div className="chat-area">
                
                {messages.list.map(m => (
                    
                    <Message key={m.id} message={m.content} author={m.author} id={m.id}/>
                ))} 
            </div>
            <div className="chat-input">
                <input type="text" placeholder="message..." onKeyDown={handleKeyDown}></input>
            </div>
        </div>
    );
}

//Pass username message and avatar in props.
function Message(props) {
    return(
        <div className="component-message" data-user-id={props.author.id} data-message-id={props.id}>
            <VisualizeUser username={props.author.name} avatar={props.author.avatar}/>
            <span>{props.message}</span>
        </div>
    );
}

/*Visualize user data on page. Depending on passed props.type render them differenty. Defaultly use same rendering as in chat message*/
function VisualizeUser(props) {
    switch (props.type) {
        case "large-popup":
            break;
        default:
            return(
                <div className="component-visualize-user-chat">
                    <img src={props.avatar}></img>
                    <span>{props.username}</span>
                </div>
            );
            break;
    }
}


function Servers(props) {

    const [servers, setServers] = React.useState({serverList : []});
    console.log("me");
    console.log(props);
    var updateServers = async() => {
        var fetch_it = await fetch(`http://${gateway}/member/3/servers`);
        props.mainData.set("userServers",await fetch_it.json());
        console.log(props.mainData);
    }
    
    React.useEffect(() =>{
        updateServers();
        console.log("Updating servers.")
        console.log(props.mainData);
    },[]);




    return(
        <div className="component-server">
            {props.mainData.get("userServers").map(m => (
                VisualizeServer(avatar="https://via.placeholder.com/50x50")
            ))} 
        </div>
    );
    //<VisualizeServer name={props.author.name} avatar={props.author.avatar}/>
}

function VisualizeServer(props) {
    switch (props.type) {
        case "large-panel":
            break;

        //Show server info in chat if linked to it.
        case "in-chat":
            return(
                <div>Not implemented.</div>
            );

        default:
            return(
                <div className="component-visualize-server-sidebar">
                    <img src={props.avatar}></img> 
                </div>  
            );
    }
}