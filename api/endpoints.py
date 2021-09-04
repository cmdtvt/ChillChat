from quart import Blueprint, websocket, request
from .gateway import gateway_blueprint, database
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
@api_blueprint.route('/message/test2/<token>/<int:channel_id>/<message>')
async def test2(token, channel_id, message):
    if token in database.members["token"] and channel_id in database.channels:
        member = database.members["token"][token]
        channel = database.channels[channel_id]
        await member.send(message, channel)
    return "hello"