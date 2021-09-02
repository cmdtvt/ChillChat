//This file has smaller components that make a Widget. It


//Show a message in chat.
class VisualizeMessage extends React.Component {
    constructor(props) {
        super(props);
        this.props =  props;
        this.messageData = this.props.messageData;
        this.message = this.props.messageData;
        this.author = this.props.messageData.author;
    }

    render() {
        return (
            <div className="chat-item" onClick={this.handleClick} id={this.props.id} key={this.message.id} data-message-id={this.message.id} data-user-id={this.author.id}>
                <img src={this.author.avatar}></img>
                <div>
                    <span><b>{this.author.name}</b></span><br></br>
                    <span>{this.message.content}</span>
                </div>
            </div>
        )
    }

    handleClick(event) {
        alert("Message was pressed.")
    }
}

//Visualize userdata.
class VisualizeUser extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
}

class NavigationLink extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        NavigationLink.defaultProps = {
            LinkLocation : "#",
            LinkText: "Link"
        }
    }

    handleClick(event) {
        window.location.href=this.props.LinkLocation;
    }

    render() {
        return (
            <div onClick={this.handleClick}>
                <span>{this.props.LinkText}</span>
            </div>

        )
    }
}