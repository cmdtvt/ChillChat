from quart import Blueprint, websocket
from .gateway import gateway_blueprint, members
import asyncio

api_blueprint = Blueprint('api', __name__)
api_blueprint.register_blueprint(gateway_blueprint, url_prefix="/gateway")
clients = set()
other = None
@api_blueprint.route('/message/<channel_id>', methods=['POST'])
async def message_create():
    return "hello"
@api_blueprint.route('/message/<channel_id>/<message_id>', methods=['DELETE', 'PUT'])
async def message_modify():
    return "hello"
@api_blueprint.route('/message/test')
async def test():
    print(members)
    test = ["moi"]
    for token, member in members.items():
        print(token, member.client)

        if member.client and token in test:
            tmp = f"Data sent to {member.name}"
            await member.client.send(tmp)
    return "hello"