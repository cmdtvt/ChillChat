from quart import Blueprint, websocket
from typing import Union
import re
import asyncio
gateway_blueprint = Blueprint('gateway', __name__)
clients = {
    "all" : set(),
    "tokenized" : {}
}
class Gateway:
    IDENTIFY = "IDENTIFY"
    IDENTIFY_REGEX = r"IDENTIFY (.{3})"
    @staticmethod
    def get_token(value : str) -> Union[str, None]:
        reg = re.match(Gateway.IDENTIFY_REGEX, value)
        if reg:
            return reg.group(1)

class Client:
    def __init__(self, token):
        self.token = token
        self.queue = None
    def authenticated(self,):
        if self.token:
            return True
        return False
    async def set_queue(self,):
        self.queue = asyncio.Queue()
    async def process(self, ws):
        print(ws)
def collect_websocket(func):
    async def wrapper(*args, **kwargs):
        global clients
        print("moi")
        client = Client(None)
        await client.set_queue()
        clients["all"].add(client)
        try:
            return await func(client, *args, **kwargs)
        finally:
            clients.remove(client)
    return wrapper

@gateway_blueprint.websocket("/")
@collect_websocket
async def connect(client):
    global clients
    websocket.headers
    while True:
        try:
            data = await websocket.receive()
            print(data)
            print(clients)
            if not client.authenticated():
                token = Gateway.get_token(data)
                if token:
                    if token not in clients["tokenized"]:
                        client.token = token
                        clients["tokenized"] = client
            else:
                await client.process(websocket)
        except asyncio.CancelledError:
            break



