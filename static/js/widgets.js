

class ChatWidget extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    handleKeyPress = (event) => {
        if(event.key === 'Enter'){
            alert("Enter was pressed!");
        }
    }
    render() {
        return(
            <Widget id="ChatWidget">

                <MessageWidget></MessageWidget>

                <input className="chat-input" placeholder="Message" onKeyPress={this.handleKeyPress}></input>
            </Widget>
        )
    }
}


//Display message area.
class MessageWidget extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        
        this.testd = {
            "id": 5270592, 
            "content": "test", 
            "author": {
                "id": 987654, 
                "name": "asd1", 
                "avatar": "lol"
            }
        }
        
    }

    render() {
        return(
            <div className="chat-area hide-scrollbar">
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
                <VisualizeMessage/>
            </div>
        )
    }
}


//List all users under eachother.
class UsersWidget extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

     render() {
         return(
             <Widget>
                 <p>this is user widget</p>
             </Widget>
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

class ErrorWidget extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <div className="ErrorWidget">
                <span>There was an error loading widget.</span>
            </div>       
        );
    }
}