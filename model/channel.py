from typing import Sequence, Optional
from .abc import Messageable, MemberType, ChannelType
from .message import MessagePayload, Message
from .server import Server
from instances import database
import json
class Channel(Messageable, ChannelType):
    def __init__(self, id : int, name : str, server : Optional[Server]=None) -> None:
        self.id = id
        self.name = name
        self.server = server

    @property
    def gateway_format(self,):
        result = {
            "id" : self.id,
            "name" : self.name,
        }
        if self.server:
            result["server"] = self.server.gateway_format
        return result

class TextChannel(Channel):
    def __init__(self, id : int, name : str, server : Optional[Server]=None, messages : Sequence[Message]=None,) -> None:
        super().__init__(id, name, server)
    async def send(self, payload : MessagePayload) -> None:
        msg = database.create_message(payload)
        if self.server:
            for i in self.server.clients:
                if i.permissions["channel"][self.id].is_allowed("VIEW_CHANNEL"):
                    tmp = msg.gateway_format
                    tmp["type"] = "message"
                    tmp = json.dumps(tmp)
                    await i.send_via_client(tmp)


        

class VoiceChannel(Channel):
    def __init__(self, id : int, name : str) -> None:
        super().__init__(id, name)
class TemporaryChannel(TextChannel):
    def __init__(self, id : int, name : str) -> None:
        super().__init__(id, name)