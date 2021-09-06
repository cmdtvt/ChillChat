from quart import  Quart, render_template, session, redirect, url_for
from instances import database
import random
import asyncio
import api.endpoints
app = Quart(__name__, static_folder="static")
app.secret_key = b"\xe1\xda\x9a!\xe2]\xbdF#P&*\xea?\xe8\xc7\xdb@\xe8\x00W\xfe*j"
app.register_blueprint(api.endpoints.api_blueprint, url_prefix="/v1")

@app.before_serving
async def init():
    await database.load_all()
    await api.endpoints.set_database(database)

@app.route('/')
async def hello():
    members = [database.members["id"][1], database.members["id"][3]]
    member = random.choice(members)
    if not member.token:
        database.create_token(member)
    session["token"] = member.token
    return await render_template("views/home.html", member=database.members["token"][session.get('token')], session=session)

@app.route('/chat')
async def chat():
    if not session.get('token'):
        return redirect(url_for('hello'))
    return await render_template('views/chat.html', member=database.members["token"][session.get('token')], session=session)
app.run(debug=True)