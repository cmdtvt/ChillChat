from queue import Queue
from quart import Quart, render_template, session, redirect, url_for, g
from instances import database
import time
import api.endpoints
from model.abc import MemberType


class ProfilerMiddleware:
    def __init__(self, app) -> None:
        self.app = app
        self.total_time = 0
        self.requests = 0

    async def __call__(self, scope: dict, receive: Queue, send):
        # print("Scope", scope)
        # print("Receive", receive)
        # print("Send", send)
        start = time.perf_counter()
        tmp = await self.app(scope, receive, send)
        print(type(tmp))
        stop = time.perf_counter()
        self.total_time += (stop - start)
        self.requests += 1
        print(f"{self.total_time/self.requests} average seconds")
        return tmp


app = Quart(__name__, static_folder="static")
api.endpoints.api_blueprint.db = database
app.asgi_app = ProfilerMiddleware(app.asgi_app)
app.jinja_options["enable_async"] = True
app.secret_key = b"\xe1\xda\x9a!\xe2]\xbdF#P&*\xea?\xe8\xc7\xdb@\xe8\x00W\xfe*j"
app.register_blueprint(api.endpoints.api_blueprint, url_prefix="/v1")


@app.before_request
def before_reqs():
    g.db = database
    session.permanent = True


@app.before_websocket
def before_websocket():
    g.db = database


@app.route('/')
async def hello():
    member_tokens = ["8c4427adf8476719ce6b31b980c41c8b7c913b3955791180713511f4b868fcb632a0c7f144dd06064a804e6599a018eeb8f5",
                     "7a7c1d7a49a5ebf4d44ca2c91b2f7d24831a049d466104b5ba319ffc692053d994d3fc05d94c852f1f8fea1d1c3c98c355e2"]
    member: MemberType = await g.db.members(token=member_tokens[0])
    await member.get_servers()
    for i in member.servers.values():
        await i.load_channels()
    print(member)
    session["token"] = member.token
    return await render_template("views/home.html", member=member, session=session)


@app.route('/login', methods='POST')
async def login():
    return "ok"


@app.route('/topikayttaja')
async def erisessio():
    member_tokens = ["8c4427adf8476719ce6b31b980c41c8b7c913b3955791180713511f4b868fcb632a0c7f144dd06064a804e6599a018eeb8f5",
                     "7a7c1d7a49a5ebf4d44ca2c91b2f7d24831a049d466104b5ba319ffc692053d994d3fc05d94c852f1f8fea1d1c3c98c355e2"]
    member: MemberType = await g.db.members(token=member_tokens[1])
    await member.get_servers()
    for i in member.servers.values():
        await i.load_channels()
    print(member)
    session["token"] = member.token
    return await render_template("views/home.html", member=member, session=session)


@app.route('/chat')
async def chat():
    if not session.get('token'):
        return redirect(url_for('hello'))
    member: MemberType = await g.db.members(token=session.get('token'))
    await member.get_servers()
    for i in member.servers.values():
        await i.load_channels()
    return await render_template('views/chat.html', member=member, session=session)
app.run(debug=True)
