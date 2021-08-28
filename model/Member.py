from .abc import Messageable
class Member(Messageable):
    def __init__(self, user_id : int, name : str):
        self.user_id = user_id
        self.name = name