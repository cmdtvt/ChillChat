from .abc import MemberType
class Server:
    def __init__(self, id : int, name : str):
        self.id = id
        self.name = name
        self.members = {}
        self.channels = {}
        self.clients = set()
