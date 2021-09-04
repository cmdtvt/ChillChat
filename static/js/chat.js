
let sock = new WebSocket("ws://127.0.0.1:5000/v1/gateway/");






class ChatApp extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.SocketToken = "123";

        //Theme data will be loaded from jinja
        this.themeData = {
            layout : {
                settings: {
                    
                },
    
                widLayout: [
                    {id:0,size:4,widget:"userinfo"},
                    {id:1,size:4,widget:"userinfo"},
                    {id:2,size:2,widget:"userinfo"},
                    {id:3,size:2,widget:"userinfo"},
                    {id:4,size:2,widget:"userinfo"},
                    {id:5,size:2,widget:"userinfo"},
                    {id:5,size:2,widget:"userinfo"},
                    {id:5,size:2,widget:"userinfo"},
                ]
            },
    
            styles : {
    
            }
        }

        this.state = {
            messageData: []
        }
    }

    //Find out what is the new way to do this.
    //https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
    UNSAFE_componentWillMount() {
        var token = this.SocketToken;

        sock.onopen = async function() {
            await sock.send(`IDENTIFY ${token}`);
            console.log("Socket started")
        }

        sock.onmessage = async (event) => {
            if (event.data == "HEARTBEAT") {
                sock.send("ACK_HEARTBEAT");
                console.log("Acknowledging heartbeat");
            } else {
                let parsed = JSON.parse(event.data)
                console.log(parsed)
                this.setState({
                    messageData: this.state.messageData.concat(
                        parsed
                    )
                })
            }

        }
    }


    render() {  
        return(
            <div className="fwrap-full ChatApp">
                <LayoutItem Widget={<NavigationWidget/>}/>
                <LayoutItem Widget={<UsersWidget/>}/>
                <LayoutItem Widget={<ChatWidget MessageData={this.state.messageData}/>}/>
                <LayoutItem Widget={<TimeWidget/>}/>
                <LayoutItem Widget={<ChannelSelectorWidget/>}/>
                
                {this.LayoutItemList}
            </div>
        )
    }
}


class LayoutItem extends React.Component {

    constructor(props) {
        super(props);
        this.props = props

        LayoutItem.defaultProps = {
            Widget: <ErrorWidget/>
        }

        //this.settings = this.props.layoutSettings
        this.widgetData = this.props.widgetData

        this.cssClasses = "item layout-item ";
        //this.cssClasses += "layout-item-size-row-"+this.settings.maxWidgetsInRow;
    }

    render() {
        return(
            <div className={this.cssClasses}>
                {this.props.Widget}
            </div>
        )
    }
}

//Basicly wrapper for custom widgets.
class Widget extends React.Component {
    constructor(props) {
        super(props);
        Widget.defaultProps = {
            id: "unset_widget"
        }
        this.props = props;
        this.widgetName = this.props.id;
    }

    render() {
        return (
            <div className="widget" id={this.widgetName}>
                {this.props.children}
            </div>
        )
    }
}



ReactDOM.render( 
    <ChatApp/>,
    document.querySelector('main')
);

