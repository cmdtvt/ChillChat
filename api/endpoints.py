from quart import Blueprint, websocket
from .gateway import gateway_blueprint
import asyncio

blueprint = Blueprint('api', __name__)
blueprint.register_blueprint(gateway_blueprint, url_prefix="/gateway")
clients = set()
other = None
@blueprint.route('/test')
async def test():
    return "hello"