from .abc import MemberType, ChannelType, Database_API_Type, ServerType
from .permissions import ServerPermissions
from .channel import TextChannel
from typing import Sequence
class Server(ServerType):
    database : Database_API_Type = None
    def __init__(self, id : int, name : str):
        self.id = id
        self.name = name
        self.default_permissions = ServerPermissions()
        self.owner = None
        self.channels = {}
    async def load_channels(self,):
        if Server.database is not None:
            channel_data = await Server.database.query(
                Server.database.queries["SELECT_JOIN"].format(
                    columns="channel.id, channel.name, channel.type",
                    table1="server_channels",
                    table2="channel ON channel.id=server_channels.channel_id",
                    where="server_channels.server_id=$1::bigint"
                ),
                (self.id,)
            )
            for i in channel_data:
                channel = None
                if i["type"] == "text":
                    channel = TextChannel(i["id"], i["name"], self)
                if channel is not None:
                    self.channels[i["id"]] = channel
    async def load_client_members(self,) -> Sequence[MemberType]:
        if Server.database is not None:
            members = []
            for i in Server.database.clients["tokenized"]:
                members.append(await Server.database.members(token=i))
            return members
    @property
    def gateway_format(self,):
        result = {
            "id" : self.id,
            "name" : self.name,
            "icon" : "https://via.placeholder.com/350x350?text="+self.name,
        }
        return result
    async def create_channel(self, name, channel_type) -> ChannelType:
        return await Server.database.create_server_channel(name, channel_type, self)
