
from .permissions import ServerPermissions, ChannelPermissions


class Role:
    def __init__(self, id: int, name: str, server_permissions: ServerPermissions, channel_permissions: dict[int, ChannelPermissions]) -> None:
        self.id = id
        self.name = name
        self.server_permissions = server_permissions
        self.channel_permissions = channel_permissions
