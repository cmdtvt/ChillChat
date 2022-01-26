import json
from typing import Any


class Payload:
    "Sent to the websocket"
    def __init__(self, payload_type: str, data: Any, action: str = None) -> None:
        self.payload_type = payload_type
        self.data = data
        self.action = action

    def __str__(self) -> str:
        return json.dumps({"type": self.payload_type, "payload": self.data, "action": self.action})
