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
