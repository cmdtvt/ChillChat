from model.permissions import ChannelPermissions
from model.message import MessagePayload, Message
from model.member import Member
from model.channel import TextChannel
from model.server import Server
import random
perm1 = ChannelPermissions()
perm1.toggle("VIEW_CHANNEL")
#perm1.toggle("SEND_MESSAGE")
perm2 = ChannelPermissions()
server = Server(1, "moi")
member1 = Member(987654, "asd1", "moi", "lol", None, {1 : server}, [], {"channel" : {
    123456789 : perm1
}, "server" : {}})
member2 = Member(123456, "asd2", "123", "lol", None, {1 : server}, [], {"channel" : {
    123456789 : perm2
}, "server" : {}})
channel1 = TextChannel(123456789, "testichannel 1", server, [])
server.members = {987654 : member1, 123456 : member2}
server.channels = {123456789 : channel1}
class Db():
    members = {
        "token" : {
            "moi" : member1,
            "123" : member2
        },
        "id" : {
            987654 : member1,
            123456 : member2
        }
    
    }
    channels = {123456789 : channel1}
    @staticmethod
    def create_message(payload : MessagePayload) -> Message:
        return Message(random.randint(15000, 10000000), payload.content, payload.author, payload.channel)
TextChannel.Db = Db