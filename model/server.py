from .abc import MemberType
class Server:
    def __init__(self, id : int, name : str):
        self.id = id
        self.name = name
        self.owner = None
        self.members = {}
        self.channels = {}
        self.clients = set()
    @property
    def gateway_format(self,):
        result = {
            "id" : self.id,
            "name" : self.name,
            "owner" : self.owner.gateway_format,
        }
        return result
