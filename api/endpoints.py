from model.message import MessagePayload
from quart import Blueprint, websocket, request
from .gateway import gateway_blueprint
from db import Db
import asyncio

api_blueprint = Blueprint('api', __name__)
api_blueprint.register_blueprint(gateway_blueprint, url_prefix="/gateway")
clients = set()
other = None
@api_blueprint.route('/message/<int:channel_id>', methods=['POST'])
async def message_create():
    return "hello"
@api_blueprint.route('/message/<int:channel_id>/<int:message_id>', methods=['DELETE', 'PUT', 'GET'])
async def message(channel_id : int, message_id : int):
    return "hello"
@api_blueprint.route('/message/test1/<token>')
async def test1(token : str=None):
    for token, member in Db.members.items():
        if token and member.client and token in test:
            tmp = f"Data sent to {member.name}"
            await member.client.send(tmp)
    return "hello"
@api_blueprint.route('/message/test2/<token>/<int:channel_id>/<message>')
async def test2(token, channel_id, message):
    if token in Db.members["token"] and channel_id in Db.channels:
        member = Db.members["token"][token]
        channel = Db.channels[channel_id]
        await member.send(message, channel)
    return "hello"