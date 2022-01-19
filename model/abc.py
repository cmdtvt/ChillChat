from typing import Any, Optional, Sequence, Set
    
class Messageable:
    async def send(self):
        raise NotImplementedError
    @property
    def gateway_format(self):
        raise NotImplementedError
class ClientType:
    pass
class ChannelType(Messageable):
    pass
class ServerType:
    id : int
    name : str
    owner : Optional[object]
    default_permissions : object
    async def load_channels() -> None:
        raise NotImplementedError
    async def load_client_members() -> Sequence[object]:
        raise NotImplementedError
    @property
    def gateway_format():
        raise NotImplementedError
    async def create_channel():
        raise NotImplementedError   
class RoleType:
    id : int
class MemberType(Messageable):
    id : int
    name : str
    token : str
    avatar : str
    servers : Sequence[ServerType]
    roles : Sequence[RoleType]
    permissions : dict[str, dict[int, object]]
    client : ClientType
    async def send_via_client(self, data : str) -> None:
        raise NotImplementedError
    async def join_server(self, server : object) -> bool:
        raise NotImplementedError
    async def get_servers(self,):
        raise NotImplementedError
class MessageType:
    id : int
    channel : ChannelType
    author : MemberType
class ChannelType(Messageable):
    id : int
    name : str
    server : ServerType
    messages : Sequence[MessageType]
    async def send(self, mpl : MessageType):
        raise NotImplementedError
class ServerType:
    channels : dict[int, ChannelType]
    members : dict[int, MemberType]
class Database_API_Type:
    members : dict[str, dict[Any, MemberType]]
    servers : dict[int, ServerType]
    channels : dict[str, dict[int, ChannelType]]
    roles : dict[int, RoleType]
    queries : dict[str, str]
    def create_token(self,) -> str:
        raise NotImplementedError
    async def create_message(self, mpl : MessageType):
        raise NotImplementedError
    async def members(self, *, token : str=None, id : int=None) -> Optional[MemberType]:
        raise NotImplementedError
    async def channels(self, *, channel_id : int=None) -> Optional[ChannelType]:
        raise NotImplementedError
    async def servers(self, *, server_id : int=None) -> Optional[ServerType]:
        raise NotImplementedError
    async def join_server(self, member : MemberType, server : ServerType) -> None:
        raise NotImplementedError
    async def create_member(self, name : str, avatar : str) -> MemberType:
        raise NotImplementedError
    async def create_server(self, name : str, owner : MemberType) -> ServerType:
        raise NotImplementedError
    async def create_server_channel(self, name : str, channel_type : str, server : ServerType) -> ChannelType:
        raise NotImplementedError
    async def query(self, sql : str, params : Optional[Sequence[Any]]=None) -> Optional[Sequence[Any]]:
        raise NotImplementedError
class PayloadType:
    payload_type : str
    data : Any