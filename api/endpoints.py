from quart import Blueprint, websocket, request
from .gateway import gateway_blueprint, members
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
    print(channel_id, message_id)
    return "hello"
@api_blueprint.route('/message/test/<token>')
async def test(token : str=None):
    for token, member in members.items():
        print(token, member.client)

        if token and member.client and token in test:
            tmp = f"Data sent to {member.name}"
            await member.client.send(tmp)
    return "hello"