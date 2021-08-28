from quart import Blueprint, websocket
import asyncio

blueprint = Blueprint('api', __name__)


@blueprint.websocket('/ws')
async def web_socket():
    websocket.headers
    while True:
        try:
            await websocket.send("hello")
            await asyncio.sleep(5)
        except asyncio.CancelledError:
            pass
@blueprint.route('/test')
async def test():
    return "hello"