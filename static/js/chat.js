class ChatApp extends React.Component {
    constructor(props) {
        super(props);
        this.props = props
        this.themeData = {
            layout : {
                settings: {
                    maxSize : 12,
                },
    
                widLayout: [
                    {id:0,size:2,widget:"userinfo"},
                    {id:1,size:2,widget:"userinfo"},
                    {id:2,size:2,widget:"userinfo"},
                    {id:3,size:2,widget:"userinfo"},
                    {id:4,size:2,widget:"userinfo"},
                    {id:5,size:2,widget:"userinfo"}
                ]
            },
    
            styles : {
    
            }
        }

        console.log(this.themeData['layout']['widLayout']);
        var state = {} //Dont shove everything here!
    
        this.LayoutItemList = [];
        for (let i of this.themeData['layout']['widLayout']) {
            var text = i.widget;
            var data = i
            this.LayoutItemList.push(<LayoutItem widgetData={data}/>);
        }

        this.state = {}
    }


    render() {
        return(
            <div className="container-full ChatApp">
                {this.LayoutItemList}
            </div>
        )
    }
}


class LayoutItem extends React.Component {

    constructor(props) {
        super(props);
        this.props = props
    }

    render() {
        return(
            <div className="item layout-item">
                Widgetname:{this.props.widgetData.widget}
            </div>
        )
    }
}

class WidgetWrapper extends React.Component {

    constructor(props) {
        super(props);
        this.props = props
    }

    render() {
        return (
            <div className="widge">
                adadadadadad
            </div>
        )
    }
}


ReactDOM.render( 
    <ChatApp/>,
    document.getElementById('main')
);

