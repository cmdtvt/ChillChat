class ChatApp extends React.Component {
    constructor(props) {
        super(props);
        this.props = props
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

        

        var layoutSettings = this.themeData['layout']['settings'];
        this.LayoutItemList = [];
        for (let i of this.themeData['layout']['widLayout']) {
            var text = i.widget;
            var data = i
            this.LayoutItemList.push(<LayoutItem widgetData={data} layoutSettings={layoutSettings}/>);
        }

        this.state = {}
    }


    render() {
        return(
            <div className="fwrap-full ChatApp">
                {this.LayoutItemList}
            </div>
        )
    }
}


class LayoutItem extends React.Component {

    constructor(props) {
        super(props);
        this.props = props
        this.settings = this.props.layoutSettings
        this.widgetData = this.props.widgetData

        //Check the setting for maximum items side by side and add needes css class.
        //this.cssClasses = "item layout-item layout-items-in-row-"+this.settings.maxWidgetsInRow;

        //Pitää ottaa maximi esineiden määrä ja lisätä layoutitemeitä niin kauan kunnes on se määrä. Sitten pudottaa seuraavalle riville. Esineen koko lasketaan. Esineiden minimi koko * koko jaettuna määrällä tai jtn.
        //Joten tarvitaan css joka skaalauttaa esineen riippuen sille annetusta koosta eli widgetData.size
        this.cssClasses = "item layout-item ";
        //this.cssClasses += "layout-item-size-row-"+this.widgetData.size;
        this.cssClasses += "layout-item-size-row-"+this.settings.maxWidgetsInRow;
    }

    render() {
        return(
            <div className={this.cssClasses}>

                <Widget/>
            </div>
        )
    }
}

class Widget extends React.Component {

    constructor(props) {
        super(props);
        this.props = props
    }

    render() {
        return (
            <div className="widget">
                <p>This is a widget</p>
            </div>
        )
    }
}


ReactDOM.render( 
    <ChatApp/>,
    document.getElementById('main')
);

