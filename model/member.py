from model.message import MessagePayload, Message
from typing import Any, Sequence
from .abc import MemberType, Messageable, ClientType
from .server import Server
from .channel import TextChannel, VoiceChannel
class Member(Messageable, MemberType):
    def __init__(self, id : int, name : str, token : str, avatar : Any, own_channel : TextChannel, servers : Sequence[Server]) -> None:
        self.id = id
        self.name = name
        self.token = token
        self.avatar = avatar
        self.own_channel = own_channel
        self.servers = servers
        self.client = None
    def set_client(self, client : ClientType) -> None:
        self.client = client
    def get_channels(self,):
        channels = []
        for servers in self.servers:
            channels.extend(servers.channels)
        return channels
    async def send(self, payload : MessagePayload) -> Message:
        return await self.own_channel.send(payload)
    @property
    def gateway_format(self,):
        response = {
            "id" : self.id,
            "name" : self.name,
            "avatar" : self.avatar

        }
        return response