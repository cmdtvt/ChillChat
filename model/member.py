from model.permissions import ChannelPermissions, ServerPermissions
from model.message import MessagePayload, Message
from typing import Any, Sequence, Union
from .abc import MemberType, Messageable, ClientType
from .server import Server
from .roles import Role
from .channel import TextChannel, VoiceChannel
class Member(Messageable, MemberType):
    database = None
    def __init__(self, id : int, name : str, token : str, avatar : Any, own_channel : TextChannel, servers : dict[int, Server], roles : dict[int, Role], permissions : dict[str, dict[int, Union[ServerPermissions, ChannelPermissions]]]) -> None:
        self.id = id
        self.name = name
        self.token = token
        self.avatar = avatar
        self.own_channel = own_channel
        self.servers = servers
        self.roles = roles
        self.permissions = permissions
        self.client = None
    def set_client(self, client : ClientType) -> None:
        self.client = client
    async def send(self, content : str, channel : TextChannel=None) -> None:
        if channel:
            if channel.default_permissions.is_allowed("SEND_MESSAGE") or self.permissions["server"][channel.server.id].is_allowed("ADMINISTRATOR") or self.permissions["channel"][channel.id].is_allowed("SEND_MESSAGE"):
                payload = MessagePayload(content, self, channel)
                await channel.send(payload)
        elif not channel and self.own_channel:
            payload = MessagePayload(content, self, self.own_channel)
            await self.own_channel.send(payload)
    async def send_via_client(self, data : str):
        if self.client:
            await self.client.send(data)
    async def join_server(self, server : Server) -> bool:
        await Member.database.join_server(self, server)
        return True
    
    @property
    def gateway_format(self,):
        response = {
            "id" : self.id,
            "name" : self.name,
            "avatar" : self.avatar

        }
        return response
    def __repr__(self):
        return f"<model.Member name={self.name}, servers={len(self.servers)}>"