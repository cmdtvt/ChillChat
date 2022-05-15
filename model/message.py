import datetime
from .abc import DBAPIBase, MemberBase, ChannelBase
from .payload import Payload
from typing import Union


class Message:
    database: DBAPIBase = None

    def __init__(self,
                 mid: int,
                 content: str,
                 author: MemberBase,
                 channel: ChannelBase,
                 timestamp: datetime.datetime = datetime.datetime.utcnow()) -> None:
        self.id = mid
        self.content = content
        self.author = author
        self.channel = channel
        self.timestamp = timestamp

    @property
    def gateway_format(self,) -> dict[str, Union[int, str, MemberBase]]:
        response = {
            "id": self.id,
            "content": self.content,
            "author": self.author.gateway_format,
            "channel": self.channel.gateway_format,
            "server": self.channel.server.gateway_format,
            "timestamp": self.timestamp.timestamp()
        }
        return response

    def __repr__(self):
        return f"<model.Message id={self.id}, author={self.author.__repr__()}, channel={self.channel.__repr__()}>"

    async def edit(self, content: str) -> None:
        if Message.database:
            await Message.database.edit_message(self, content)
            pl = Payload("message", self.gateway_format, "modify")
            await self.channel.server.broadcast(pl)

    async def delete(self,) -> None:
        if Message.database:
            await Message.database.delete_message(self)
            pl = Payload("message", self.gateway_format, "remove")
            await self.channel.server.broadcast(pl)


class MessagePayload:
    def __init__(self, content: str, author: MemberBase, channel: ChannelBase) -> None:
        self.content = content
        self.author = author
        self.channel = channel
