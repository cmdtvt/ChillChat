console.log("React runs!");

ReactDOM.render( 
    
    <ChatApp/>,
    document.getElementById('main')
);

//Manages the canvas and layouts are loaded into it.
function ChatApp() {

    var themeData = {
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

    console.log(themeData['layout']['widLayout']);
    var state = {} //Dont shove everything here!

    var LayoutItemList = [];
    for (let i of themeData['layout']['widLayout']) {
        var text = i.widget;
        LayoutItemList.push(<LayoutItem widgetName={text}/>);
    }

    return (
        <div className="container-full ChatApp">
            {LayoutItemList}
        </div>
    )

}

function LayoutItem(props) {
    return (
        <div className="item layout-item">
            Data from parent is:{props.widgetName}
        </div>
    )
}

//Inherited by widgets so they know how to scale etc...
function WidgetWrapper() {
    return (
        <div className="widge">
            adadadadadad
        </div>
    )
}


