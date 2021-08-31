from model.abc import MemberType
class Message:
    def __init__(self, id : int, content : str, author : MemberType) -> None:
        self.id = id
        self.content = content
        self.author = author
    @property
    def gateway_format(self,):
        response = {
            "id" : self.id,
            "content" : self.content,
            "author" : self.author.gateway_format
        }
        return response

class MessagePayload:
    def __init__(self, content : str, author : MemberType)-> None:
        self.content = content
        self.author = author