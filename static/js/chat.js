console.log("React runs!");

ReactDOM.render( 
    <App />,
    document.getElementById('main')

);

//Manages the canvas and layouts are loaded into it.
function App() {

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

    console.log(themeData['layout']['data']);
    var state = themeData;

    return (
        <div className="App">
            {themeData['layout']['widLayout'].map((grid) => (<p key={grid.id}>{grid.size}</p>))}
        </div>
    )

}

function LayoutItem() {
    return (
        <div>This is a layout item.</div>
    )
}

function WidgetWrapper() {
    
}
