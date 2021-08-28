from quart import Blueprint, websocket
import asyncio

blueprint = Blueprint('api', __name__)

clients = set()
other = None

def collect_websocket(func):
    async def wrapper(*args, **kwargs):
        global clients
        queue = asyncio.Queue()
        clients.add(queue)
        try:
            return await func(queue, *args, **kwargs)
        finally:
            clients.remove(queue)
    return wrapper
@blueprint.websocket('/ws')
@collect_websocket
async def web_socket(queue):
    websocket.headers
    while True:
        try:
            data = await queue.get()
            await  websocket.send(data)
        except asyncio.CancelledError:
            break

async def broadcast(message):
    for queue in clients:
        print(clients)
        await queue.put(message)
@blueprint.route('/test')
async def test():
    await broadcast("testi")
    return "hello"