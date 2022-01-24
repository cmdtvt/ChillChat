from asyncio.queues import Queue
from quart import Blueprint, copy_current_websocket_context, websocket, session
from typing import Union, Any
from model.abc import ClientType, MemberType
import instances
import json
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
        self.receive_task : asyncio.Task = None
        self.loop = None
        self.queue : Queue = None
        self._missed_heartbeats_in_row = 0
    async def close_connection(self,):
        self.heartbeat_task.cancel()
        self.process_queue_task.cancel()
        try:
            await websocket.close(400)
        except RuntimeError as e:
            print(e)
    def authenticated(self,):
        if self.token:
            return True
        return False
    async def heartbeat(self,):
        global database
        while True:
            try:
                if not self.heartbeat_task.cancelled():
                    #print(database.clients)
                    await self.send(Gateway.HEARTBEAT)
                    self._missed_heartbeats_in_row += 1
                    if self._missed_heartbeats_in_row >= 5:
                        await self.close_connection()
                        break
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                await self.close_connection()
    async def receive(self,):
        while True:
            try:
                if not self.receive_task.cancelled():
                    data = await websocket.receive()
                    if data == Gateway.ACK_HEARTBEAT:
                        self._missed_heartbeats_in_row = 0
            except asyncio.CancelledError:
                await self.close_connection()
                break
        

    async def _process_queue(self,):
        while True:
            try:
                data = await self.queue.get()
                if not self.process_queue_task.cancelled():
                    await websocket.send(data)

                await asyncio.sleep(0.01)
            except asyncio.CancelledError:
                await self.close_connection()
                break
    async def process(self,):
        try:
            if not self.queue:
                self.queue = asyncio.Queue()
                await self.member.get_servers()
                member_data = self.member.gateway_format
                member_data["servers"] = [x.gateway_format for x in self.member.servers.values()]
                member_data = {"payload" : member_data, "type" : "member_data", "action" : None}
                member_data = json.dumps(member_data)
                await self.send(member_data)
                self.heartbeat_task = asyncio.ensure_future(
                    copy_current_websocket_context(
                        self.heartbeat
                    )()
                )
                self.process_queue_task = asyncio.ensure_future(
                    copy_current_websocket_context(
                        self._process_queue
                    )()
                )
                self.receive_task = asyncio.ensure_future(
                    copy_current_websocket_context(
                        self.receive
                    )()
                )
            await asyncio.gather(self.heartbeat_task, self.process_queue_task, self.receive_task, return_exceptions=True)
        except asyncio.CancelledError:
            pass
        finally:
            self.close_connection()
    async def send(self, data : str) -> Any:
        await self.queue.put(data)
            
def collect_websocket(func):
    async def wrapper(*args, **kwargs):
        global database
        loop = asyncio.get_event_loop()
        client = Client()
        client.loop = loop
        database.clients["all"].add(client)
        try:
            return await func(client, *args, **kwargs)
        finally:
            database.clients["all"].remove(client)
            if client.token:
                if client.token in database.clients["tokenized"]:
                    database.clients["tokenized"][client.token].remove(client)
            if client.member:
                if client.member.id in database.clients["id"]:
                    database.clients["id"][client.member.id].remove(client)
    return wrapper
@gateway_blueprint.websocket("/")
@collect_websocket
async def gateway(client):
    global tasks
    global database
    websocket.headers
    client_task = None
    try:
        if session and session.get('token'):
            token = session.get('token')
            task =  await websocket.receive()
            member = await database.members(token=token)
            if member and task.startswith("START"):
                client.token = token
                client.member = member
                client_task = asyncio.ensure_future(copy_current_websocket_context(client.process)())
                if token not in database.clients["tokenized"]:
                    database.clients["tokenized"][client.token] = set()
                if member.id not in database.clients["id"]:
                    database.clients["id"][member.id] = set()
                database.clients["tokenized"][client.token].add(client)
                database.clients["id"][member.id].add(client)
                await asyncio.gather(client_task)
    except asyncio.CancelledError as e:
        print(e)
    finally:
        if client_task:
            client_task.cancel()
                            
    # except Exception as e:
    #     print(e)
    # while True:
    #     try:
    #         if session:
    #             token = session.get('token')
    #             if token:
    #                 if token in database.clients["tokenized"]:
    #                     print(True)
    #                     await asyncio.sleep(5)
    #                 else:
    #                     member = await database.members(token=token)
    #                     if member:
    #                         client.token = token
    #                         client.member = member
    #                         if client not in tasks:
    #                             tasks[client] =  await websocket.receive()
    #                             await client.process(websocket, tasks[client])
    #                             del tasks[client]
    #                         if token not in database.clients["tokenized"]:
    #                             database.clients["tokenized"][client.token] = client
    #                             database.clients["id"][member.id] = client
    #                             # database.members["token"][token].set_client(client)
    #                             # for i, server in database.members["token"][token].servers.items():
    #                             #     server.clients.add(database.members["token"][token])
    #         await asyncio.sleep(0.01)
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

            
        # except asyncio.CancelledError:
        #     break
        # except AttributeError as e:
        #     print(e)