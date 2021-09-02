from model.abc import MemberType, ChannelType
from typing import Union
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
            "author" : self.author.gateway_format
        }
        return response

class MessagePayload:
    def __init__(self, content : str, author : MemberType, channel : ChannelType)-> None:
        self.content = content
        self.author = author