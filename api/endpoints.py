import quart
from model.message import MessagePayload
from quart import Blueprint, websocket, request, session
import api.gateway
import asyncio
database = None
async def set_database(db):
    global database
    database = db
    api.gateway.database = database
api_blueprint = Blueprint('api', __name__)
api_blueprint.register_blueprint(api.gateway.gateway_blueprint, url_prefix="/gateway")
@api_blueprint.route('/message/<int:channel_id>', methods=['POST'])
async def message_create(channel_id : int):
    global database
    form = await request.form
    if 'message' in form:
        msg = form['message']
        token = session.get('token')
        channel = database.channels["all"].get(channel_id)
        member = database.members["token"].get(token)
        if member and channel:
            mpl = MessagePayload(msg, member, channel)
            await channel.send(mpl)
            return "ok"
    return "not ok"
@api_blueprint.route('/messages/<int:channel_id>')
async def get_messages(channel_id : int):
    global database
    if session.get('token'):
        channel = database.channels["all"].get(channel_id)
        messages = channel.messages
        return quart.jsonify([x.gateway_format for x in messages])
@api_blueprint.route('/message/<int:channel_id>/<int:message_id>', methods=['DELETE', 'PUT', 'GET'])
async def message(channel_id : int, message_id : int):
    return "hello"
@api_blueprint.route('/test')
async def test1():
    mem2 = database.members["id"][1]
    mem1 = database.members["id"][3]
    ser = database.servers[1]
    chan = database.channels["all"][2]
    print(chan.messages)
    print(ser, ser.channels)
    return "test1"
@api_blueprint.route('/message/test2/<token>/<int:channel_id>/<message>')
async def test2(token, channel_id, message):
    if token in database.members["token"] and channel_id in database.channels:
        member = database.members["token"][token]
        channel = database.channels[channel_id]
        await member.send(message, channel)
    return "hello"