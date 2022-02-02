
from .permissions import ServerPermissions, ChannelPermissions
from .server import Server


class Group:
    def __init__(self, gid: int,
                 name: str,
                 server: Server,
                 server_permissions: ServerPermissions,
                 channel_permissions: dict[int, ChannelPermissions]) -> None:
        self.id = gid
        self.name = name
        self.server = server
        self.server_permissions = server_permissions
        self.channel_permissions = channel_permissions
