from .abc import MemberType, ChannelType
from .permissions import ServerPermissions
class Server:
    database = None
    def __init__(self, id : int, name : str):
        self.id = id
        self.name = name
        self.owner = None
        self.members = {}
        self.channels = {}
        self.clients = set()
        self.default_permissions = ServerPermissions()
    @property
    def gateway_format(self,):
        result = {
            "id" : self.id,
            "name" : self.name,
            "owner" : self.owner.gateway_format,
        }
        return result
    async def create_channel(self, name, channel_type) -> ChannelType:
        return await Server.database.create_server_channel(name, channel_type, self)
