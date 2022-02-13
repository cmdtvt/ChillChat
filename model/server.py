from .abc import MemberType, ChannelType, DBAPIType, ServerType
from .permissions import ServerPermissions, PermissionsSource, ChannelPermissions
from .channel import TextChannel
from .payload import Payload
from typing import Sequence


class Server(ServerType):
    database: DBAPIType = None

    def __init__(self,
                 sid: int,
                 name: str,
                 icon: str = None,
                 default_permissions: int = PermissionsSource.DEFAULT_SERVER_PERMISSIONS):
        self.id = sid
        self.name = name
        if icon is None:
            icon = f"https://via.placeholder.com/350x350?text={self.name}"
        self.icon = icon
        self.default_permissions = ServerPermissions(default_permissions)
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

    async def load_client_members(self, member_ids: Sequence[int] = None) -> Sequence[MemberType]:
        if Server.database is not None:
            server_members_data = []
            if member_ids:
                server_members_data = await Server.database.query(
                    Server.database.queries["SELECT_WHERE"].format(
                        table="server_members",
                        where="server_id=$1::bigint AND member_id IN ({})".format(
                            ",".join(member_ids)
                        )
                    ),
                    (self.id,)
                )
            else:
                server_members_data = await Server.database.query(
                    Server.database.queries["SELECT_WHERE"].format(
                        table="server_members",
                        where="server_id=$1::bigint"
                    ),
                    (self.id,)
                )
            members_ids = [x["member_id"] for x in server_members_data]
            members = []
            for x in members_ids:
                if x in Server.database.clients["id"]:
                    members.append(Server.database.clients["id"][x]["member"])
            return members

    @property
    def gateway_format(self,):
        result = {
            "id": self.id,
            "name": self.name,
            "icon": self.icon,
        }
        return result

    async def broadcast(self, payload: Payload) -> None:
        members = await self.load_client_members()
        permissions = {}
        print(payload)
        print(type(payload))
        if payload.payload_type == "message":
            required = ChannelPermissions.VIEW_CHANNEL
            channel = payload.data["channel"]
            default = channel["default_permissions"]
            permissions["channel"] = channel
            permissions["required"] = required
            permissions["default"] = (default & required) == required
        for member in members:
            if payload.payload_type == "message":
                default = permissions["default"]
                channel = permissions["channel"]
                required = permissions["required"]
                user_permissions = member.permissions["channel"].get(channel["id"], 0)
                user_permissions = (user_permissions & required) == required
                if not default and not user_permissions:
                    continue
            await member.send_via_client(payload)

    async def multicast(self, payload: Payload, member_ids: Sequence[int] = None) -> None:
        members = await self.load_client_members(member_ids)
        for member in members:
            await member.send_via_client(payload)

    async def create_channel(self, name, channel_type) -> ChannelType:
        channel = await Server.database.create_server_channel(name, channel_type, self)
        payload = Payload("channel", channel.gateway_format, "new")
        await self.broadcast(payload)
