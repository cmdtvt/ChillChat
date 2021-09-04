

class ChatWidget extends React.Component {
	constructor(props) {
		super(props);
		this.props = props;
		this.state = {
			messageData: []
		}
		//getDerivedStateFromProps
	}

	handleKeyPress = (event) => {
		if(event.key === 'Enter'){
			this.setState({InputText:""});
		}
	}

	render() {
		//console.log(this.state.messageData)
		return(
			<Widget id="ChatWidget">
				<MessageWidget messageData={this.props.MessageData}></MessageWidget>
				<input className="chat-input" placeholder="Message" onKeyPress={this.handleKeyPress} value={this.state.InputText}></input>
			</Widget>
		)
	}
}


//Display message area.
class MessageWidget extends React.Component {
	constructor(props) {
		super(props);
		this.props = props;
		this.state = {
			messageData: []
		}
	}

	//https://stackoverflow.com/questions/45585542/detecting-when-user-scrolls-to-bottom-of-div-with-react-js
	scrollToBottom = () => {
		this.messagesEnd.scrollIntoView({ behavior: "smooth" });
	}
	  
	componentDidMount() {
		this.scrollToBottom();
		window.addEventListener('scroll', this.handleScroll, { passive: true })
	}
	  
	componentDidUpdate() {
		this.scrollToBottom();
		window.removeEventListener('scroll', this.handleScroll)
	}

	handleScroll(event) {
		console.log("Scrolling chat!");
	}

	render() {		
		return(
			<div className="chat-area hide-scrollbar">
				{this.props.messageData.map(message => (
					<VisualizeMessage messageData={message}/>
				))}
				<div style={{ float:"left", clear: "both" }}
            		 ref={(el) => { this.messagesEnd = el; }}>
        		</div>
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
				 <VisualizeUser/>
				 <VisualizeUser/>
				 <VisualizeUser/>
				 <VisualizeUser/>

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

class TimeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.props = props;
		this.state = {
			time: "00:00"
		}
	}

	render() {
		return(
			<Widget id="TimeWidget">
				<span>{this.state.time}</span>
			</Widget>
		)
	}

	componentDidMount() {
		this.interval = setInterval(() => {
			var time = convertDatetoFormat(new Date())
			this.setState({ time: time })
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}
}

class NavigationWidget extends React.Component {
	constructor(props) {
		super(props);
		this.props = props;
	}

	 render() {
		 return (
			<Widget id="NavigationWidget">
				<NavigationLink LinkLocation="https://www.google.com"/>
				<NavigationLink LinkLocation="https://www.google.com"/>
				<NavigationLink LinkLocation="https://www.google.com"/>
				<NavigationLink LinkLocation="https://www.google.com"/>
				<NavigationLink LinkLocation="https://www.google.com"/>
				<NavigationLink LinkLocation="https://www.google.com"/>
			</Widget>
		 );
	 }
}

class ChannelSelectorWidget extends React.Component {
	constructor(props) {
		super(props);
		this.props = props;
	}

	render() {
		return (
			<Widget id="ChannelSelectorWidget">
				<span>This is channel selector.</span>
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