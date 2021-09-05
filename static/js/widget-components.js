//This file has smaller components that make a Widget. It


//Show a message in chat.
class VisualizeMessage extends React.Component {
    constructor(props) {
        super(props);
        this.props =  props;
        this.messageData = this.props.messageData;
        this.message = this.props.messageData;
        this.author = this.props.messageData.author;

        this.date = convertUnixTimestampToDate(this.message.time)
        this.date = convertDatetoFormat(this.date)



        //Message type should decied how "special" content is shown. Images, videos etc... Like embeding.
    }

    render() {
        return (
            <div className="chat-item" onClick={this.handleClick} id={this.props.id} key={this.message.id} data-message-id={this.message.id} data-user-id={this.author.id} data-message-type="embed">
                <img src={this.author.avatar}></img>
                <div>
                    <span><b>{this.author.name}</b></span>
                    <span className="time">{this.date}</span><br></br>
                    <span>{this.message.content}</span>

                    <EmbedInMessage url="https://via.placeholder.com/400x900" embedText="Embed placeholder content"/>
                </div>
            </div>
        )
    }
}

class EmbedInMessage extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {}
    }

    render() {
        return (
             <div className="embed">
                 <span>{this.props.embedText}</span><br></br>
                 <img src={this.props.url}></img>
             </div>
        );
    }
}

//Visualize userdata.
class VisualizeUser extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <div className="VisualizeUser">
                <img src="https://via.placeholder.com/350x350"></img>
                <div className="fcenter-content">
                    <div>
                        <span>Rauli</span><br/>
                        <span className="status">Playing: Warframe</span>
                    </div>
                </div>
            </div>
        )
    }
}

class NavigationLink extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        //this.LinkLocation = this.props.LinkLocation
        this.state = {
            LinkLocation: this.props.LinkLocation
        }
        console.log(this.state);

        /*
        NavigationLink.defaultProps = {
            LinkLocation : "#",
            LinkText: "Link"
        }
        */
    }

    handleClick(event) {
        console.log("YEEET")
        console.log(this.LinkLocation);
        window.location.href = this.state.LinkLocation;
    }

    render() {
        return (
            <div className="nav-link" onClick={() => this.handleClick}>
                <span>Link</span>
            </div>

        )
    }
}