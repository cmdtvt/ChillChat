from typing import Any, Optional, Sequence


class ClientType:
    pass


class ServerType:
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


class RoleType:
    id: int


class ChannelType:
    pass


class PermissionsType:
    def __init__(self, permissions):
        self._permissions = permissions

    def merge(self, other_permissions):
        raise NotImplementedError


class MemberType:
    id: int
    name: str
    token: str
    avatar: str
    servers: dict[int, ServerType]
    roles: Sequence[RoleType]
    permissions: dict[str, dict[int, object]]
    client: ClientType

    @property
    def gateway_format(self):
        raise NotImplementedError

    async def send_via_client(self, data: str) -> None:
        raise NotImplementedError

    async def join_server(self, server: object) -> bool:
        raise NotImplementedError

    async def get_servers(self,):
        raise NotImplementedError


class MessageType:
    id: int
    channel: ChannelType
    author: MemberType


class ChannelType:
    id: int
    name: str
    server: ServerType
    messages: Sequence[MessageType]

    async def send(self, mpl: MessageType):
        raise NotImplementedError



class ServerType:
    channels: dict[int, ChannelType]
    members: dict[int, MemberType]


class Database_API_Type:
    members: dict[str, dict[Any, MemberType]]
    servers: dict[int, ServerType]
    channels: dict[str, dict[int, ChannelType]]
    roles: dict[int, RoleType]
    queries: dict[str, str]
    host: str
    username: str
    password: str
    port: int
    pool: Any
    clients: dict[str, dict[Any, set[ClientType]]]
    hasher: Any

    def create_token(self,) -> str:
        raise NotImplementedError

    def create_password(self, password: str) -> str:
        raise NotImplementedError

    def verify_password(self, password_hash: str, password: str):
        raise NotImplementedError

    async def create_message(self, mpl: MessageType):
        raise NotImplementedError

    async def edit_message(self, message: MessageType, content: str) -> MessageType:
        raise NotImplementedError

    async def delete_message(self, message: MessageType) -> bool:
        raise NotImplementedError

    async def members(self, *, token: str = None, member_id: int = None) -> Optional[MemberType]:
        raise NotImplementedError

    async def channels(self, *, channel_id: int = None) -> Optional[ChannelType]:
        raise NotImplementedError

    async def servers(self, *, server_id: int = None) -> Optional[ServerType]:
        raise NotImplementedError

    async def messages(self, *, message_id: int = None) -> Optional[MessageType]:
        raise NotImplementedError

    async def create_member(self, name: str, avatar: str) -> MemberType:
        raise NotImplementedError

    async def remove_from_server(self, member: MemberType, server: ServerType) -> None:
        raise NotImplementedError

    async def join_server(self, member: MemberType, server: ServerType) -> None:
        raise NotImplementedError

    async def create_server(self, name: str, owner: MemberType) -> ServerType:
        raise NotImplementedError

    async def delete_server(self, server: ServerType) -> bool:
        raise NotImplementedError

    async def create_server_channel(self, name: str, channel_type: str, server: ServerType) -> ChannelType:
        raise NotImplementedError

    async def query(self, sql: str, params: Optional[Sequence[Any]] = None) -> Optional[Sequence[Any]]:
        raise NotImplementedError


class PayloadType:
    payload_type: str
    data: Any
