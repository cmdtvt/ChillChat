from typing import Optional
from .abc import ChannelType, Database_API_Type, ServerType
from .message import MessagePayload, Message
from .payload import Payload
from .permissions import ChannelPermissions


class Channel(ChannelType):
    database: Database_API_Type = None

    def __init__(self, cid: int, name: str, server: Optional[ServerType] = None) -> None:
        self.id = cid
        self.name = name
        self.server = server
        self.default_permissions = ChannelPermissions()

    @property
    def gateway_format(self,):
        result = {
            "id": self.id,
            "name": self.name
        }
        if self.server:
            result["server"] = self.server.gateway_format
        return result


class TextChannel(Channel):
    async def send(self, payload: MessagePayload) -> None:
        if Channel.database is not None:
            msg = await Channel.database.create_message(payload)
            if self.server:
                payload = Payload("message", msg.gateway_format, "new")
                await self.server.broadcast(payload)
                return "ok"

    async def messages(self,):
        if Channel.database is not None:
            msgs = await Channel.database.query(Channel.database.queries["SELECT_WHERE_ORDER"].format(
                table="message",
                where="channel_id=$1::BIGINT",
                order="id"
            ), (self.id,))
            messages_list = []
            for i in msgs:
                author = await Channel.database.members(member_id=i["author_id"])
                messages_list.append(Message(i["id"], i["content"], author, self))
            return messages_list

    def __repr__(self):
        return f"<model.TextChannel id={self.id} name={self.name} server={self.server.__repr__()}>"


class VoiceChannel(Channel):
    def __init__(self, vcid: int, name: str) -> None:
        super().__init__(vcid, name)


class TemporaryChannel(TextChannel):
    def __init__(self, tcid: int, name: str) -> None:
        super().__init__(tcid, name)
