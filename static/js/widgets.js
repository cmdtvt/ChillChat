

class ChatWidget extends React.Component {
	constructor(props) {
		super(props);
		this.props = props;
		this.state = {
			inputText: "",
			MessageData: this.props.MessageData,
		}
		console.log("ChatWidget")
		console.log(this.props.MessageData)
		//getDerivedStateFromProps
	}

	handleKeyPress = async (event) => {
		if(event.key === 'Enter'){
			let inputVal = document.querySelector(".chat-input")
			let route = "http://127.0.0.1:5000/v1/message/2"
			await fetch(route, {method: 'POST', body : `message=${inputVal.value}`, headers: {"Content-Type" : "application/x-www-form-urlencoded"}})
			inputVal.value = ''
			//this.setState({InputText:""}); //Empties the input after enter press.
		}
	}


	// componentDidMount() {
	// 	this.addEventListener('scroll', this.handleScroll);
	// }
	
	// componentWillUnmount() {
	// 	this.removeEventListener('scroll', this.handleScroll);
	// }
	
	handleScroll = (event) =>{
		console.log("Item has been scrolled: "+event);
	}


	render() {
		//console.log(this.state.messageData)
		console.log("ChatWidget")
		console.log(this.props.MessageData)
		return(
			<Widget id="ChatWidget">
				<MessageWidget MessageData={this.state.MessageData}></MessageWidget>
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
			error: null, //If problem in fetching data.
			MessageData: this.props.MessageData
		}
		console.log("yey")
		console.log(this.props.MessageData);
		this.fetchURL = "http://127.0.0.1:5000/v1/messages/2";
		console.log(this.state);
	}

	//https://stackoverflow.com/questions/45585542/detecting-when-user-scrolls-to-bottom-of-div-with-react-js
	//http://127.0.0.1:5000/v1/messages/2
	scrollToBottom = () => {
		this.messagesEnd.scrollIntoView({ behavior: "smooth" });
	}
	
	//Process batch of messages from server.
	handleNewMessages = (data) => {
		console.log("Handling new messages: "+data);
		this.setState({
			MessageData: this.state.MessageData.concat(data)
		});
		console.log(this.state.messageData);

	}

	componentDidMount() {
		this.scrollToBottom();
		window.addEventListener('scroll', this.handleScroll, { passive: true });
		
		fetch(this.fetchURL)
		.then(response => response.json())
		.then(this.handleNewMessages)
		.catch()
	}
	  
	componentDidUpdate() {
		this.scrollToBottom();
		window.removeEventListener('scroll', this.handleScroll)
	}

	handleScroll(event) {console.log("Scrolling chat!");}


	// getDerivedStateFromProps(props, state) {
	// 	console.log("State thungy.")
	// 	console.log(props);
	// }

	render() {
		console.log("Message widget is rerendering.");
		console.log("yey2")
		console.log(this.props.MessageData);

		return(
			<div className="chat-area hide-scrollbar">
				{this.state.MessageData.map(message => (
					<VisualizeMessage messageData={message}/>
				))}
				{!this.state.error &&
					<h3>{this.state.error}</h3>
				}
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