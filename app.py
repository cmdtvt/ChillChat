import asyncio
import ssl
from queue import Queue
from quart import Quart, render_template, session, redirect, url_for, request, g, jsonify
from instances import database, cache
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
        stop = time.perf_counter()
        self.total_time += (stop - start)
        self.requests += 1
        return tmp


app = Quart(__name__, static_folder="views/SPA/static", template_folder="views/SPA")
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=86400,
    SEND_FILE_MAX_AGE_DEFAULT=86400
)
app.asgi_app = ProfilerMiddleware(app.asgi_app)
app.jinja_options["enable_async"] = True
app.secret_key = b"\xe1\xda\x9a!\xe2]\xbdF#P&*\xea?\xe8\xc7\xdb@\xe8\x00W\xfe*j"
app.register_blueprint(api.endpoints.api_blueprint, url_prefix="/v1")


@app.before_serving
async def startup():
    def _exception_handler(loop, context):
        exception = context.get("exception")
        if isinstance(exception, ssl.SSLError):
            return  # Handshake failure

        loop.default_exception_handler(context)

    loop = asyncio.get_event_loop()
    loop.set_exception_handler(_exception_handler)


@app.before_first_request
def before_first_request():
    session.permanent = True


@app.before_request
def before_request():
    g.db = database
    g.cache = cache
    session.modified = True


@app.before_websocket
def before_websocket():
    g.db = database
    session.modified = True


@app.after_request
def after_request(response):
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    return response


@app.route('/')
async def home():
    member = None
    if session and session.get('token'):
        member = await g.db.members(token=session.get('token'))
    return await render_template("index.html", member=member)


@app.route('/chat')
async def chat():
    if not session.get('token'):
        return redirect(url_for('hello'))
    return await render_template('chat.html')


@app.route('/login', methods=['POST'])
async def login():
    form = await request.form
    username = form.get('username')
    password = form.get('password')
    if username and password:
        member_search = await g.db.members(username=username)
        print(member_search)
        member, password_hash = member_search
        if member and password_hash:
            loop = asyncio.get_running_loop()
            db = g.db
            verify = await loop.run_in_executor(
                None,
                lambda: db.verify_password(password_hash, password)
            )
            if verify:
                session["token"] = member.token
                return jsonify(member.gateway_format)
    return False, 400


@app.route('/logout', methods=['GET'])
async def logout():
    if session and session.get('token'):
        session.pop('token')
        return True, 200
    else:
        return False, 400



app.run(host="0.0.0.0", debug=True, certfile='self-signed/server.crt', keyfile='self-signed/server.key')
