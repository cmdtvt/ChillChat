from model.permissions import ChannelPermissions, ServerPermissions
from model.message import MessagePayload, Message
from typing import Any, Sequence, Union
from .abc import MemberType, Messageable, ClientType
from .server import Server
from .roles import Role
from .channel import TextChannel, VoiceChannel
class Member(Messageable, MemberType):
    def __init__(self, id : int, name : str, token : str, avatar : Any, own_channel : TextChannel, servers : dict[int, Server], roles : dict[int, Role], permissions : dict[str, dict[int, Union[ServerPermissions, ChannelPermissions]]]) -> None:
        self.id = id
        self.name = name
        self.token = token
        self.avatar = avatar
        self.own_channel = own_channel
        self.servers = servers
        self.client = None
        self.roles = roles
        self.permissions = permissions
    def set_client(self, client : ClientType) -> None:
        self.client = client
    async def send(self, payload : MessagePayload) -> None:
        if self.own_channel:
            await self.own_channel.send(payload)
    async def send_via_client(self, data : str):
        if self.client:
            await self.client.send(data)
    @property
    def gateway_format(self,):
        response = {
            "id" : self.id,
            "name" : self.name,
            "avatar" : self.avatar

        }
        return response