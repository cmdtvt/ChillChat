from quart import Blueprint, websocket
from typing import Union, Any
from model.abc import ClientType
from model.member import Member
import re
import asyncio
gateway_blueprint = Blueprint('gateway', __name__)
clients = {
    "all" : set(),
    "tokenized" : {}
}
members = {"moi" : Member(31321312, "asd", "moi", "lol", None, None), "123" : Member(31321312, "asd", "123", "lol", None, None)}
tasks = {}
class Gateway:
    IDENTIFY = "IDENTIFY"
    IDENTIFY_REGEX = r"IDENTIFY (.{3})"
    HEARTBEAT = "HEARTBEAT"
    ACK_HEARTBEAT = "ACK_HEARTBEAT"
    @staticmethod
    def get_token(value : str) -> Union[str, None]:
        reg = re.match(Gateway.IDENTIFY_REGEX, value)
        if reg:
            return reg.group(1)


class Client(ClientType):
    def __init__(self,):
        self.token = None
        self.heartbeat_task = None
        self.process_queue_task = None
        self.queue = None
        self.ws = None
        self._missed_heartbeats_in_row = 0
    def authenticated(self,):
        if self.token:
            return True
        return False
    async def heartbeat(self,):
        while True:
            if self.ws:
                result = await self.send(Gateway.HEARTBEAT)
                self._missed_heartbeats_in_row += 1
                if self._missed_heartbeats_in_row >= 5:
                    await self.ws.close(400)
            await asyncio.sleep(5)
    async def _process_queue(self,):
        while True:
            if self.ws and self.queue:
                data = await self.queue.get()
                print(data)
                await self.ws.send(data)
                await asyncio.sleep(0.01)
    async def process(self, ws, data):
        if not self.queue:
            self.queue = asyncio.Queue()
        if not self.ws:
            self.ws = ws
        if not self.heartbeat_task:
            self.heartbeat_task = asyncio.get_event_loop().create_task(self.heartbeat())
        if not self.process_queue_task:
            self.process_queue_task = asyncio.get_event_loop().create_task(self._process_queue())
        if data == Gateway.ACK_HEARTBEAT:
            self._missed_heartbeats_in_row -= 1
        if self._missed_heartbeats_in_row >= 5:
            
            await ws.close(400)
    async def send(self, data : str) -> Any:
        await self.queue.put(data)
def collect_websocket(func):
    async def wrapper(*args, **kwargs):
        global clients
        client = Client()
        clients["all"].add(client)
        try:
            return await func(client, *args, **kwargs)
        finally:
            clients["all"].remove(client)
            if client.token:
                del clients["tokenized"][client.token]
    return wrapper
@gateway_blueprint.websocket("/")
@collect_websocket
async def gateway(client):
    global clients
    global tasks
    websocket.headers
    while True:
        try:
            if client not in tasks:
                data = asyncio.create_task(websocket.receive())
                tasks[client] = data
            if tasks[client].done():
                if not client.authenticated():
                    token = Gateway.get_token(data.result())
                    if token:
                        if token not in clients["tokenized"]:
                            client.token = token
                            clients["tokenized"][client.token] = client
                            if token in members:
                                members[token].set_client(client)
                            await client.process(websocket, data.result())
                else:
                    await client.process(websocket, data.result())
                del tasks[client]
            await asyncio.sleep(0.01)
        except asyncio.CancelledError:
            break



