from quart import  Quart, render_template
from api.endpoints import blueprint

app = Quart(__name__, static_folder="static")
app.register_blueprint(blueprint, url_prefix="/v1")
@app.route('/')
async def hello():
    return await render_template("views/home.html")

@app.route('/chat')
async def chat():
    return await render_template('views/chat.html')

app.run(debug=True)