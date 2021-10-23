
console.log("asd")


function ChatApp() {
    

    const[messages, setMessages] = React.useState({});
    const[gateway, setGateway] = React.useState(() => {
        let sock = new WebSocket("ws://127.0.0.1:5000/v1/gateway/");
        sock.onopen = async () => {
            var data = await fetch("http://127.0.0.1:5000/v1/channel/2/messages")
            data = await data.json()
            setMessages(data)
            sock.send(`START`);
            console.log("Socket started")
        }
        
        sock.onmessage = (event) => {
            if (event.data == "HEARTBEAT") {
                sock.send("ACK_HEARTBEAT");
                console.log("Acknowledging heartbeat");
            } else {
                let parsed = JSON.parse(event.data)
                console.log(parsed)
            }
        
        }

    })
    React.useEffect(async () => {
        console.log(gateway)
    }, [gateway])
    React.useEffect(async () => {
        console.log("use effect2 triggered")
        console.log(messages)
    }, [messages])


    return React.createElement('div', null, "Hello world")
}
// {onClick:async() => {
//     console.log(test2)
//     await getMessages(setTest2)
// }

ReactDOM.render( 
    React.createElement(ChatApp, {}, null),
    document.querySelector('main')
);

