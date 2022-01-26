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

class Permissions:
    def __init__(self, _keys) -> None:
        self._keys = _keys

    def toggle(self, key: str) -> bool:
        if self._keys and key in self._keys:
            self._keys[key] = not self._keys[key]

    def enable(self, key: str) -> bool:
        if self._keys and key in self._keys:
            self._keys[key] = True

    def disable(self, key: str) -> bool:
        if self._keys and key in self._keys:
            self._keys[key] = False

    def is_allowed(self, key: str) -> bool:
        if self._keys and key in self._keys:
            return self._keys[key]

    @property
    def keys(self,) -> dict:
        return self._keys

    @keys.setter
    def keys(self, keys: dict) -> None:
        self._keys = keys

    @property
    def gateway_format(self,):
        return self._keys.copy()


class ServerPermissions(Permissions):
    def __init__(self) -> None:
        _keys = {
            "ADMINISTRATOR": False,
        }
        super().__init__(_keys)

    def clone(self,):
        result = ServerPermissions()
        result.keys = super().keys()
        return result

    def __iter__(self,):
        return iter(self._keys.items())


class ChannelPermissions(Permissions):
    def __init__(self) -> None:
        _keys = {
            "VIEW_CHANNEL": True,
            "SEND_MESSAGE": True,
        }
        super().__init__(_keys)

    def __iter__(self,):
        return iter(self._keys.items())

    def clone(self,):
        result = ChannelPermissions()
        result.keys = super().keys()
        return result
