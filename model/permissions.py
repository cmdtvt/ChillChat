class Permissions:
    def __init__(self) -> None:
        self._keys = None
    def toggle(self, key : str) -> bool:
        if self._keys and key in self._keys:
            self._keys[key] = not self._keys[key]
    def is_allowed(self, key : str) -> bool:
        if self._keys and key in self._keys:
            return self._keys[key]
class ServerPermissions(Permissions):
    def __init__(self) -> None:
        self._keys = {
        }
        super().__init__()
class ChannelPermissions(Permissions):
    def __init__(self) -> None:
        self._keys = {
            "VIEW_CHANNEL" : False,
            "SEND_MESSAGE" : False,
        }