from quart import  Quart, render_template
from instances import  database
import api.endpoints
api.endpoints.database = database
app = Quart(__name__, static_folder="static")
app.register_blueprint(api.endpoints.api_blueprint, url_prefix="/v1")
@app.before_first_request
async def init():
    await database.load_all()

@app.route('/')
async def hello():

    return await render_template("views/home.html")

@app.route('/chat')
async def chat():
    member = database.members[1]
    return await render_template('views/chat.html', member=member)

app.run(debug=True)