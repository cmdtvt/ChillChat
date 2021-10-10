from typing import Sequence, Optional
from .abc import Messageable, MemberType, ChannelType, Database_API_Type, ServerType
from .message import MessagePayload, Message
from .permissions import ChannelPermissions
import json
class Channel(ChannelType):
    database : Database_API_Type = None
    def __init__(self, id : int, name : str, server : Optional[ServerType]=None) -> None:
        self.id = id
        self.name = name
        self.server = server
        self.default_permissions = ChannelPermissions()

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
    
    def __init__(self, id : int, name : str, server : Optional[ServerType]=None) -> None:
        super().__init__(id, name, server)
    async def send(self, payload : MessagePayload) -> None:
        if Channel.database is not None:
            msg = await Channel.database.create_message(payload)
            if self.server:
                for i in await self.server.load_client_members():
                    #TODO:
                    #PERMISSIONS
                    #if self.default_permissions.is_allowed("VIEW_CHANNEL") or i.permissions["channel"][self.id].is_allowed("VIEW_CHANNEL"):
                    tmp = msg.gateway_format
                    tmp["type"] = "message"
                    tmp = json.dumps(tmp)
                    await i.send_via_client(tmp)
                    return "ok"
    async def messages(self,):
        print("=>1")
        if Channel.database is not None:
            msgs = await Channel.database.query(Channel.database.queries["SELECT_WHERE_ORDER"].format(
                table="message",
                where="channel_id=$1::BIGINT",
                order="id"
            ), self.id)
            print("=>2")
            messages_list = []
            tmp = {}
            for i in msgs:
                if i["author_id"] in tmp:
                    messages_list.append(Message(i["id"], i["content"], tmp[i["author_id"]], self))
                else:
                    tmp[i["author_id"]] = await Channel.database.members(id=i["author_id"])
                    messages_list.append(Message(i["id"], i["content"], tmp[i["author_id"]], self))
            print("=>3", messages_list)
            return messages_list
                    
    def __repr__(self):
        return f"<model.TextChannel id={self.id} name={self.name} server={self.server.__repr__()}>"


        

class VoiceChannel(Channel):
    def __init__(self, id : int, name : str) -> None:
        super().__init__(id, name)
class TemporaryChannel(TextChannel):
    def __init__(self, id : int, name : str) -> None:
        super().__init__(id, name)