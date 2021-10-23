const gateway = "127.0.0.1:5000/v1";
//"http://127.0.0.1:5000/v1/messages/2"
let sock;

ReactDOM.render(
    <VisualizeUser/>,
    document.getElementById("servers")
);

ReactDOM.render(
    <Chat/>,
    document.getElementById("chat")
);

ReactDOM.render(
    <p>bööööp</p>,
    document.getElementById("contacts")
);



function Chat() {
    //const [isPaused, setPause] = useState(false);
    const [messages, setMessages] = React.useState([]);
    const [socket, setSocket] = React.useState(true)
    console.log(messages);
    // 
    
    React.useEffect(() => {
        
    }, [messages])
    React.useEffect(() => {
        sock = new WebSocket(`ws://${gateway}/gateway/`);
        sock.onopen = async () => {
            var fetch_it = await fetch(`http://${gateway}/channel/2/messages`)
            if(fetch_it.status == 200) {
                fetch_it = await fetch_it.json();
    
                setMessages(fetch_it)
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
                messages.push(parsed)
                setMessages(messages)
                //llls(parsed)
            }
        }
    }, [socket])

    const handleKeyDown = async (event) => {
        if (event.key === 'Enter') {
            console.log("SENDING MESSAGE")
            let formData = new FormData();
            formData.append('message', event.target.value)
            await fetch(`http://${gateway}/channel/2/message`,
            {
                method: 'post',
                body: formData
            })
            event.target.value = ""
        }
    }

    return(
        
        <div className="component-chat">
            <div className="chat-area">
                {messages.map(m => (
                    <Message message={m.content} username={m.author.name} avatar={m.author.avatar}/>
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
        <div className="component-message" data-user-id="{{props.userID}}" data-message-id="{{props.messageID}}">
            <VisualizeUser username={props.username} avatar={props.avatar}/>
            <span>{props.message}</span>
        </div>
    );
}

/*Visualize user data on page. Depending on passed props.type render them differenty. Defaultly use same rendering as in chat message*/
function VisualizeUser(props) {
    switch (props.type) {
        case "chat":
            return(
                <div className="component-visualize-user-chat">
                    <img src="{props.avatar}"></img>
                    <span>{props.username}</span>
                </div>
            )
            break;

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