from .abc import Messageable
class Channel(Messageable):
    def __init__(self, channel_id : int, channel_name : str) -> None:
        self.channel_id = channel_id
        self.channel_name = channel_name
class TextChannel(Channel):
    def __init__(self, channel_id : int, channel_name : str) -> None:
        super().__init__(channel_id, channel_name)

class VoiceChannel(Channel):
    def __init__(self, channel_id : int, channel_name : str) -> None:
        super().__init__(channel_id, channel_name)
class TemporaryChannel(TextChannel):
    def __init__(self, channel_id : int, channel_name : str) -> None:
        super().__init__(channel_id, channel_name)