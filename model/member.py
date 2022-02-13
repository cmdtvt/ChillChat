
from .permissions import ChannelPermissions, ServerPermissions
from .message import MessagePayload
from typing import Any, Union, Optional
from .abc import DBAPIType, MemberType, PayloadType
from .payload import Payload
from .server import Server
from .group import Group
from .channel import TextChannel, Channel


class Member(MemberType):
    database: Optional[DBAPIType] = None

    def __init__(self, id: int,
                 name: str,
                 token: str,
                 avatar: Any,
                 *,
                 own_channel: TextChannel = None,
                 servers: dict[int, Server] = None,
                 groups: dict[int, Group] = None,
                 permissions: dict[str,
                                   dict[
                                       int,
                                       Union[ServerPermissions, ChannelPermissions]]] = None
                 ) -> None:
        self.id = id
        self.name = name
        self.token = token
        self.avatar = avatar
        self.own_channel = own_channel
        self.servers = servers
        self.groups = groups
        self.permissions = permissions if permissions else {"server": {}, "channel": {}}

    async def send(self, content: str, channel: TextChannel = None) -> None:
        # if channel.default_permissions.is_allowed("SEND_MESSAGE") or
        # self.permissions["server"][channel.server.id].is_allowed("ADMINISTRATOR") or
        # self.permissions["channel"][channel.id].is_allowed("SEND_MESSAGE"):
        if channel:

            default_perms = channel.default_permissions & 4
            own_channel_perms = self.permissions["channel"].get(channel.id, 0) if self.permissions.get("channel") else 0
            own_channel_perms &= 4
            print(default_perms)
            print(own_channel_perms)
            if default_perms == 4 or own_channel_perms == 4:
                payload = MessagePayload(content, self, channel)
                await channel.send(payload)
        elif not channel and self.own_channel:
            payload = MessagePayload(content, self, self.own_channel)
            await self.own_channel.send(payload)

    async def send_via_client(self, payload: Union[PayloadType, str]):
        if Member.database and self.token in Member.database.clients["tokenized"]:
            for client in Member.database.clients["tokenized"][self.token]["clients"]:
                await client.send(str(payload))

    async def join_server(self, server: Server) -> bool:
        await Member.database.join_server(self, server)
        pl_self = Payload("server", server.gateway_format, "new")
        pl_server = Payload("server_member", self.gateway_format, "new")
        await self.send_via_client(pl_self)
        await server.broadcast(pl_server)
        return True

    async def remove_from_server(self, server: Server) -> bool:
        await Member.database.remove_from_server(self, server)
        pl_self = Payload("server", server.gateway_format, "remove")
        pl_server = Payload("server_member", self.gateway_format, "remove")
        await self.send_via_client(pl_self)
        await server.broadcast(pl_server)
        return True

    async def create_server(self, name: str) -> bool:
        server = await Member.database.create_server(name, self)
        if server:
            pl = Payload("server", server.gateway_format, "new")
            print(str(pl))
            await self.send_via_client(pl)
            return True
        return False

    async def get_permissions(self,) -> dict[
                                            object,
                                            dict[
                                                int,
                                                Union[
                                                    ServerPermissions,
                                                    ChannelPermissions
                                                ]
                                            ]]:
        if Member.database:
            channel_perms = await Member.database.cached_query(
                Member.database.queries["SELECT_WHERE"].format(
                    table="member_channel_permissions",
                    where="member_id=$1::bigint"
                ),
                (self.id,)
            )
            permissions = {"channel": {}, "server": {}}
            for x in channel_perms:
                permissions["channel"][x["channel_id"]] = ChannelPermissions(x["permissions"])

            server_perms = await Member.database.cached_query(
                Member.database.queries["SELECT_WHERE"].format(
                    table="server_members",
                    where="member_id=$1::bigint"
                ),
                (self.id,)
            )
            for x in server_perms:
                permissions["server"][x["server_id"]] = ServerPermissions(x['permissions'])
            self.permissions = permissions
            return permissions
        return None

    async def get_servers(self,) -> Optional[dict[int, Server]]:
        if Member.database:
            server_data = await Member.database.query(
                Member.database.queries["SELECT_WHERE"].format(
                    table="server_members",
                    where="member_id=$1::bigint"
                ),
                (self.id,)
            )
            servers = {}
            for i in server_data:
                servers[i["server_id"]] = await Member.database.servers(server_id=i["server_id"])
            self.servers = servers
            return self.servers
        return None

    @property
    def gateway_format(self,):
        permissions = {
            "channel": {},
            "server": {}
        }
        if self.permissions:
            for cid, permission in self.permissions["channel"].items():
                permissions["channel"][cid] = permission.gateway_format
            for sid, permission in self.permissions["server"].items():
                permissions["server"][sid] = permission.gateway_format
        response = {
            "id": self.id,
            "name": self.name,
            "avatar": self.avatar,
            "permissions": permissions

        }
        return response

    def __repr__(self):
        return f"<model.Member id={self.id} name={self.name}>"
