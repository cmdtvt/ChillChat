

class ChatWidget extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return(
            <Widget id="ChatWidget">

                <MessageWidget></MessageWidget>

                <input className="chat-input" placeholder="Message"></input>
            </Widget>
        )
    }
}


//Display message area.
class MessageWidget extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return(
            <textarea className="chat-area" disabled>
                this is a test for chat
            </textarea>
        )
    }


}



class WeatherWidget extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return(
            <Widget id="Weather">
                <span>Weather is pretty good today!</span>
            </Widget>
        )
    }
}