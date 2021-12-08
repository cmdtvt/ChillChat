from asyncio.queues import Queue
from quart import Blueprint, websocket, session
from typing import Union, Any
from model.abc import ClientType, MemberType
import instances
import re
import asyncio
database = instances.database
gateway_blueprint = Blueprint('gateway', __name__)
tasks = {}
class Gateway:
    IDENTIFY = "IDENTIFY"
    IDENTIFY_REGEX = r"IDENTIFY (.{100})"
    HEARTBEAT = "HEARTBEAT"
    ACK_HEARTBEAT = "ACK_HEARTBEAT"
    @staticmethod
    def get_token(value : str) -> Union[str, None]:
        reg = re.match(Gateway.IDENTIFY_REGEX, value)
        if reg:
            return reg.group(1)


class Client(ClientType):
    def __init__(self,):
        self.token : str = None
        self.member : MemberType = None
        self.heartbeat_task : asyncio.Task = None
        self.process_queue_task : asyncio.Task = None
        self.queue : Queue = None
        self.ws = None
        self._missed_heartbeats_in_row = 0
    def authenticated(self,):
        if self.token:
            return True
        return False
    async def heartbeat(self,):
        while True:
            if self.ws:
                await self.send(Gateway.HEARTBEAT)
                self._missed_heartbeats_in_row += 1
                if self._missed_heartbeats_in_row >= 5:
                    await self._stop()
                    break
            await asyncio.sleep(5)
        
    async def _stop(self,):
        self.process_queue_task.cancel()
        await self.ws.close(400)
    async def _process_queue(self,):
        while True:
            if self.ws and self.queue:
                data = await self.queue.get()
                await self.ws.send(data)
                await asyncio.sleep(0.01)
    async def process(self, ws, data):
        if not self.queue:
            self.queue = asyncio.Queue()
        if not self.ws:
            self.ws = ws
            if self.member:
                self.send(self.member.gateway_format)
        if not self.heartbeat_task:
            self.heartbeat_task = asyncio.get_event_loop().create_task(self.heartbeat())
        if not self.process_queue_task:
            self.process_queue_task = asyncio.get_event_loop().create_task(self._process_queue())
        if data == Gateway.ACK_HEARTBEAT:
            self._missed_heartbeats_in_row -= 1
        if self._missed_heartbeats_in_row >= 5:
            await self._stop()
            self.heartbeat_task.cancel()
    async def send(self, data : str) -> Any:
        await self.queue.put(data)
def collect_websocket(func):
    async def wrapper(*args, **kwargs):
        global database
        client = Client()
        database.clients["all"].add(client)
        try:
            return await func(client, *args, **kwargs)
        finally:
            database.clients["all"].remove(client)
            if client.token:
                del database.clients["tokenized"][client.token]
    return wrapper
@gateway_blueprint.websocket("/")
@collect_websocket
async def gateway(client):
    global tasks
    global database
    websocket.headers
    while True:
        try:
            if session:
                if session.get('token'):
                    token = session.get('token')
                    member = await database.members(token=token)
                    if member:
                        if client not in tasks:
                            tasks[client] = asyncio.create_task(websocket.receive())
                        if token not in database.clients["tokenized"]:
                            client.token = token
                            client.member = member
                            database.clients["tokenized"][client.token] = client
                            # database.members["token"][token].set_client(client)
                            # for i, server in database.members["token"][token].servers.items():
                            #     server.clients.add(database.members["token"][token])
                        if tasks[client].done():
                            await client.process(websocket, tasks[client].result())
                            del tasks[client]
                        
            await asyncio.sleep(0.01)
            # 
            #     tasks[client] = data
            # if tasks[client].done():
            #     if not client.authenticated():
            #         token = Gateway.get_token(data.result())
            #         print(token, data.result())
            #         if token:
            #             if token not in clients["tokenized"]:
            #                 if token in database.members["token"]:
            #                     client.token = token
            #                     clients["tokenized"][client.token] = client
            #                     database.members["token"][token].set_client(client)
            #                     for i, server in database.members["token"][token].servers.items():
            #                         server.clients.add(database.members["token"][token])
            #                     await client.process(websocket, data.result())

            
        except asyncio.CancelledError:
            break