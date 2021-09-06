from model.abc import MemberType, ChannelType
from typing import Union
import time
class Message:
    def __init__(self, id : int, content : str, author : MemberType, channel : ChannelType) -> None:
        self.id = id
        self.content = content
        self.author = author
        self.channel = channel
    @property
    def gateway_format(self,) -> dict[str, Union[int, str, MemberType]]:
        response = {
            "id" : self.id,
            "content" : self.content,
            "author" : self.author.gateway_format,
            "channel" : self.channel.gateway_format,
            "time" : time.time()
        }
        return response
    def __repr__(self):
        return f"<model.Message id={self.id} content={self.content[0:5]}, author={self.author.__repr__()}, channel={self.channel.__repr__()}>"

class MessagePayload:
    def __init__(self, content : str, author : MemberType, channel : ChannelType)-> None:
        self.content = content
        self.author = author
        self.channel = channel