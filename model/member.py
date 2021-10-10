from model.permissions import ChannelPermissions, ServerPermissions
from model.message import MessagePayload, Message
from typing import Any, Sequence, Union, Optional
from .abc import Database_API_Type, MemberType, Messageable, ClientType
from .server import Server
from .role import Role
from .channel import TextChannel, VoiceChannel
class Member(MemberType):
    database : Optional[Database_API_Type] = None
    def __init__(self, id : int, name : str, token : str, avatar : Any, own_channel : TextChannel=None, servers : dict[int, Server]=None, roles : dict[int, Role]=None, permissions : dict[str, dict[int, Union[ServerPermissions, ChannelPermissions]]]=None) -> None:
        self.id = id
        self.name = name
        self.token = token
        self.avatar = avatar
        self.own_channel = own_channel
        self.servers = servers
        self.roles = roles
        self.permissions = permissions
    async def send(self, content : str, channel : TextChannel=None) -> None:
        if channel:
            if channel.default_permissions.is_allowed("SEND_MESSAGE") or self.permissions["server"][channel.server.id].is_allowed("ADMINISTRATOR") or self.permissions["channel"][channel.id].is_allowed("SEND_MESSAGE"):
                payload = MessagePayload(content, self, channel)
                await channel.send(payload)
        elif not channel and self.own_channel:
            payload = MessagePayload(content, self, self.own_channel)
            await self.own_channel.send(payload)
    async def send_via_client(self, data : str):
        if Member.database and self.token in Member.database.clients["tokenized"]:
            await Member.database.clients.send(data)
    async def join_server(self, server : Server) -> bool:
        await Member.database.join_server(self, server)
        return True
    
    async def get_servers(self,):
        # "SELECT_JOIN" : "SELECT {columns} FROM {table1} JOIN {table2} WHERE {where}"
        if Member.database:
            server_data = await Member.database.query(
                Member.database.queries["SELECT_JOIN"].format(
                    columns="server.id AS id, server.name AS \"name\", server.owner AS owner",
                    table1="server_members",
                    table2="server ON server.id=server_members.server_id",
                    where="server_members.member_id=$1::bigint"
                ),
                self.id
            )
            servers = {}
            for i in server_data:
                servers[i["id"]] = Server(i["id"], i["name"])

            self.servers = servers
    @property
    def gateway_format(self,):
        response = {
            "id" : self.id,
            "name" : self.name,
            "avatar" : self.avatar

        }
        return response
    def __repr__(self):
        return f"<model.Member id={self.id} name={self.name}>"