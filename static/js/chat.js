console.log("React runs!");

ReactDOM.render( 
    <App />,
    document.getElementById('main')

);

//Manages the canvas and layouts are loaded into it.
function App() {

    var userdata = {
        layout : {


            settings: {
                maxSize : 12,
            },

            layout: [{size:2,widget:"userinfo"}]
        },

        username: 'TeroTesti',
    }

    console.log(userdata['layout']['layout']);
    var state = {}

    return (
        <div className="App">
            {userdata['layout']['layout'].map((grid) => (<p>{grid.size}</p>))}
        </div>
    )

}

function LayoutItem() {
    return (
        <div>This is a layout item.</div>
    )
}
