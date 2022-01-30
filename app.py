import asyncio
from queue import Queue
from quart import Quart, render_template, session, redirect, url_for, request, g, jsonify
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
        print(type(tmp), tmp)
        stop = time.perf_counter()
        self.total_time += (stop - start)
        self.requests += 1
        print(f"{self.total_time/self.requests} average seconds")
        return tmp


app = Quart(__name__, static_folder="static")
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=86400
)
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


@app.after_request
def after_reqs(response):
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    return response


@app.route('/')
async def hello():
    member = None
    if session and session.get('token'):
        member = await g.db.members(token=session.get('token'))
    return await render_template("views/home.html", member=member)


@app.route('/login', methods=['POST'])
async def login():
    form = await request.form
    username = form.get('username')
    password = form.get('password')
    if username and password:
        member, password_hash = await g.db.members(username=username)
        if member and password_hash:
            loop = asyncio.get_running_loop()
            database = g.db
            verify = await loop.run_in_executor(
                None,
                lambda: database.verify_password(password_hash, password)
            )
            if verify:
                session["token"] = member.token
                return jsonify(member.gateway_format)
    return "not ok", 400


@app.route('/logout', methods=['GET'])
async def logout():
    if session and session.get('token'):
        session.pop('token')
        return "ok", 200
    else:
        return "not ok", 400


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
