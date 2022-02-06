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
# Start will be 16 binarynumbers, each representing one permission,
# with first digit from right being the administrator, 0000000000000001
# User Permissions will be lessused than Role/group, default being a group,
# but can apply permissions to specific user,
# owner having all permissions at all times (maybe change this later)
from typing import Sequence
from .abc import PermissionsType


class Permissions(PermissionsType):
    def __init__(self, permissions) -> None:
        super().__init__(permissions)

    def merge(self, other_permissions: Sequence[PermissionsType]):
        current = self._permissions
        for i in other_permissions:
            current &= i._permissions
        return current

    @property
    def gateway_format(self,):
        return self._permissions


class ServerPermissions(Permissions):
    def __init__(self, permissions) -> None:
        super().__init__(permissions)


class ChannelPermissions(Permissions):
    def __init__(self, permissions) -> None:
        super().__init__(permissions)
