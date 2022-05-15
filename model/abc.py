from typing import Any, Optional, Sequence, Union


class ClientBase:
    pass


class ServerBase:
    id: int
    name: str
    owner: Optional[object]
    default_permissions: object

    async def load_channels(self) -> None:
        raise NotImplementedError

    async def load_client_members(self) -> Sequence[object]:
        raise NotImplementedError

    @property
    def gateway_format(self):
        raise NotImplementedError

    async def create_channel(self):
        raise NotImplementedError


class RoleBase:
    id: int


class ChannelBase:
    pass


class PermissionBase:
    def __init__(self, permissions : int, display_name : str = ""):
        self.permissions : int = permissions
        self.display_name = display_name

    def format(self, format_type = "json") -> dict:
        if format_type == "json":
            return {"permission" : self.permissions, "name" : self.display_name}

    def __and__(self, other) -> int:
        return self.permissions & other
    def __or__(self, other) -> int:
        return self.permissions | other


class MemberBase:
    id: int
    name: str
    token: str
    avatar: str
    servers: dict[int, ServerBase]
    groups: Sequence[RoleBase]
    permissions: dict[str, dict[ int, PermissionBase]]
    client: ClientBase

    @property
    def gateway_format(self) -> dict:
        raise NotImplementedError

    async def send_via_client(self, data: str) -> None:
        raise NotImplementedError

    async def join_server(self, server: object) -> bool:
        raise NotImplementedError

    async def get_servers(self,):
        raise NotImplementedError


class MessageBase:
    id: int
    channel: ChannelBase
    author: MemberBase


class ChannelBase:
    id: int
    name: str
    server: ServerBase
    messages: Sequence[MessageBase]

    async def send(self, mpl: MessageBase):
        raise NotImplementedError


class ServerBase:
    channels: dict[int, ChannelBase]
    members: dict[int, MemberBase]


class DBAPIBase:
    members: dict[str, dict[Any, MemberBase]]
    servers: dict[int, ServerBase]
    channels: dict[str, dict[int, ChannelBase]]
    roles: dict[int, RoleBase]
    queries: dict[str, str]
    host: str
    username: str
    password: str
    port: int
    pool: Any
    clients: dict[str, dict[Any, set[ClientBase]]]
    hasher: Any

    def create_token(self,) -> str:
        raise NotImplementedError

    def create_password(self, password: str) -> str:
        raise NotImplementedError

    def verify_password(self, password_hash: str, password: str):
        raise NotImplementedError

    async def create_message(self, mpl: MessageBase):
        raise NotImplementedError

    async def edit_message(self, message: MessageBase, content: str) -> MessageBase:
        raise NotImplementedError

    async def delete_message(self, message: MessageBase) -> bool:
        raise NotImplementedError

    async def members(self, *, token: str = None, member_id: int = None) -> Optional[MemberBase]:
        raise NotImplementedError

    async def channels(self, *, channel_id: int = None) -> Optional[ChannelBase]:
        raise NotImplementedError

    async def servers(self, *, server_id: int = None) -> Optional[ServerBase]:
        raise NotImplementedError

    async def messages(self, *, message_id: int = None) -> Optional[MessageBase]:
        raise NotImplementedError

    async def create_member(self, name: str, avatar: str) -> MemberBase:
        raise NotImplementedError

    async def remove_from_server(self, member: MemberBase, server: ServerBase) -> None:
        raise NotImplementedError

    async def join_server(self, member: MemberBase, server: ServerBase) -> None:
        raise NotImplementedError

    async def create_server(self, name: str, owner: MemberBase) -> ServerBase:
        raise NotImplementedError

    async def delete_server(self, server: ServerBase) -> bool:
        raise NotImplementedError

    async def create_server_channel(self, name: str, channel_type: str, server: ServerBase) -> ChannelBase:
        raise NotImplementedError

    async def query(self, sql: str, params: Optional[Sequence[Any]] = None) -> Optional[Sequence[Any]]:
        raise NotImplementedError


class PayloadBase:
    payload_type: str
    data: Any
