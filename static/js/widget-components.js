//This file has smaller components that make a Widget. It


//Show a message in chat.
class VisualizeMessage extends React.Component {
    constructor(props) {
        super(props);
        this.props =  props;

        VisualizeMessage.defaultProps = {
            id : "undefined",
            content: "undefined",
            author: {}
        }
    }

    render() {
        return (
            <div className="chat-item" onClick={this.handleClick} id={this.props.id}>
                <img src="http://via.placeholder.com/350x350"></img>
                <div>
                    <span><b>USER</b></span><br></br>
                    <span>lorem ipsum dolor sit amet, consectetur adip occ  occumst lorem ipsum dolor sit amet, consectetur adip occ  occumstlorem ipsum dolor sit amet, consectetur adip occ  occumst</span>
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