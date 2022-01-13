import json
from typing import Any
class Payload:
    def __init__(self, payload_type : str, data : Any) -> None:
        self.payload_type = payload_type
        self.data = data
    def __str__(self) -> str:
        return json.dumps({"type" : self.payload_type, "payload" : self.data})