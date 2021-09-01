class ChatApp extends React.Component {
    constructor(props) {
        super(props);
        this.props = props

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

        console.log(this.themeData['layout']['widLayout']);
        var state = {} //Dont shove everything here!


        //Change so layout items are added to right area with ID
        /*
        var layoutSettings = this.themeData['layout']['settings'];
        this.LayoutItemList = [];
        for (let i of this.themeData['layout']['widLayout']) {
            var text = i.widget;
            var data = i
            this.LayoutItemList.push(<LayoutItem widgetData={data} layoutSettings={layoutSettings}/>);
        }
        */
        this.state = {}
    }


    render() {
        console.log("me does render!");
        return(
            <div className="fwrap-full ChatApp">
                <LayoutItem/>
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
            
        }

        //this.settings = this.props.layoutSettings
        this.widgetData = this.props.widgetData

        this.cssClasses = "item layout-item ";
        //this.cssClasses += "layout-item-size-row-"+this.settings.maxWidgetsInRow;
    }

    render() {
        return(
            <div className={this.cssClasses}>
                <ChatWidget/>
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
    document.getElementById('main')
);

