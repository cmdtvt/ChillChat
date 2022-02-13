#     Protocol
# Source -> Using
# Server Permissions : Source
# Channel Permissions : Source
#
# User Permissions [Server Permissions and List[Channel Permissions]] : Using
# Role/group Permissions [Server Permissions and List[Channel Permissions]] : Using
# Permissions will be per channel and server basis
# Merging permissions with OR, checking permissions with AND
# After checking, permissions will have to match for action to be let trough
# Example:
# Channel requires 001 permission:
# User has 110 permission, and it's role has 011 permission
# After merging user, will have 111 permissions, and then it will be checked with AND
# 001 AND 111 = 001
# Other cases:
# 101 AND 110 = 100
#
# Start will be 16 binary numbers, each representing one permission,
# with first digit from right being the administrator, 0000000000000001
# User Permissions will be less used than Role/group, default being a group,
# but can apply permissions to specific user,
# owner having all permissions at all times (maybe change this later)
from typing import Sequence
from .abc import PermissionsType


class PermissionsSource(PermissionsType):
    DEFAULT_SERVER_PERMISSIONS = 10
    DEFAULT_CHANNEL_PERMISSIONS = 6

    def __init__(self, permissions: int) -> None:
        super().__init__(permissions)


class PermissionsUsing:
    def __init__(self) -> None:
        self.permissions = None
    pass


class PermissionsUsing(PermissionsType):
    def __init__(self, permissions: int) -> None:
        super().__init__(permissions)

    def merge(self, other_permissions: Sequence[PermissionsUsing]) -> int:
        current: int = self.permissions
        for i in other_permissions:
            current |= i.permissions
        return current

    def check_permission(self, target_permissions: int, other_permissions: Sequence[PermissionsUsing]) -> bool:
        current: int = self.merge(other_permissions)
        return (current & target_permissions) == target_permissions


class ServerPermissions(PermissionsSource):
    # 0000 0000 0000 0000
    # 1 : administrator
    # 2 : view_channels
    # 4 : manage_channels
    # 8 : send_messages
    # 16 : manage messages
    # 32 : manage groups
    # 64 : manage server
    ADMINISTRATOR = 1
    VIEW_CHANNELS = 2
    MANAGE_CHANNELS = 4
    SEND_MESSAGES = 8
    MANAGE_MESSAGES = 16
    MANAGE_GROUPS = 32
    MANAGE_SERVER = 64

    def __init__(self, permissions: int = PermissionsSource.DEFAULT_SERVER_PERMISSIONS) -> None:
        super().__init__(permissions)


class ChannelPermissions(PermissionsSource):
    # 0000 0000 0000 0000
    # 1 : administrator
    # 2 : view_channel
    # 4 : manage own messages/send messages
    # 8 : delete other people's messages
    # 16 : mute people, permanent/timed
    # 32 : manage channel
    ADMINISTRATOR = 1
    VIEW_CHANNEL = 2
    SEND_MESSAGE = 4
    MANAGE_MESSAGES = 8
    MODERATE = 16
    MANAGE_CHANNEL = 32

    def __init__(self, permissions: int = PermissionsSource.DEFAULT_CHANNEL_PERMISSIONS) -> None:
        super().__init__(permissions)
