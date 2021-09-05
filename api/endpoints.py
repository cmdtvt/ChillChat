from quart import Blueprint, websocket, request
import api.gateway
import asyncio
database = None
api.gateway.database = database
api_blueprint = Blueprint('api', __name__)
api_blueprint.register_blueprint(api.gateway.gateway_blueprint, url_prefix="/gateway")
@api_blueprint.route('/message/<int:channel_id>', methods=['POST'])
async def message_create():
    return "hello"
@api_blueprint.route('/message/<int:channel_id>/<int:message_id>', methods=['DELETE', 'PUT', 'GET'])
async def message(channel_id : int, message_id : int):
    return "hello"
@api_blueprint.route('/test')
async def test1():
    mem2 = database.members[1]
    mem1 = database.members[3]
    ser = database.servers[1]
    print(ser, ser.channels)
    return "test1"
@api_blueprint.route('/message/test2/<token>/<int:channel_id>/<message>')
async def test2(token, channel_id, message):
    if token in database.members["token"] and channel_id in database.channels:
        member = database.members["token"][token]
        channel = database.channels[channel_id]
        await member.send(message, channel)
    return "hello"