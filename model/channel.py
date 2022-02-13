from typing import Optional
from .abc import ChannelType, DBAPIType, ServerType, MessageType
from .message import MessagePayload, Message
from .payload import Payload
from .permissions import ChannelPermissions, PermissionsSource


class Channel(ChannelType):
    async def send(self, mpl: MessageType):
        pass

    database: DBAPIType = None

    def __init__(self,
                 cid: int,
                 name: str,
                 server: Optional[ServerType] = None,
                 default_permissions: int = PermissionsSource.DEFAULT_CHANNEL_PERMISSIONS) -> None:
        self.id = cid
        self.name = name
        self.server = server
        self.default_permissions = ChannelPermissions(default_permissions)

    @property
    def gateway_format(self,):
        result = {
            "id": self.id,
            "name": self.name,
            "default_permissions": self.default_permissions.gateway_format
        }
        if self.server:
            result["server"] = self.server.gateway_format
        return result


class TextChannel(Channel):
    async def send(self, payload: MessagePayload) -> None:
        if Channel.database is not None:
            author = payload.author
            await author.get_permissions()
            permission_required = ChannelPermissions.SEND_MESSAGE

            default_perms = (self.default_permissions & permission_required) == permission_required
            author_channel_perms = 0
            if author.permissions.get("channel"):
                author_channel_perms = author.permissions["channel"].get(self.id, 0)
            author_channel_perms = (author_channel_perms & permission_required) == permission_required

            if default_perms or author_channel_perms:
                msg = await Channel.database.create_message(payload)
                if self.server:
                    payload = Payload("message", msg.gateway_format, "new")
                    await self.server.broadcast(payload)
                    return "ok"

    async def messages(self,):
        if Channel.database is not None:
            msgs = await Channel.database.query(Channel.database.queries["SELECT_WHERE_ORDER"].format(
                table="message",
                where="channel_id=$1::BIGINT",
                order="id"
            ), (self.id,))
            messages_list = []
            for i in msgs:
                author = await Channel.database.members(member_id=i["author_id"])
                messages_list.append(Message(i["id"], i["content"], author, self, i["timestamp"]))
            return messages_list

    def __repr__(self):
        return f"<model.TextChannel id={self.id} name={self.name} server={self.server.__repr__()}>"


class VoiceChannel(Channel):
    def __init__(self, vcid: int, name: str) -> None:
        super().__init__(vcid, name)


class TemporaryChannel(TextChannel):
    def __init__(self, tcid: int, name: str) -> None:
        super().__init__(tcid, name)
