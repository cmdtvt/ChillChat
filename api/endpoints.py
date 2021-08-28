from quart import Blueprint

blueprint = Blueprint('api', __name__)


@blueprint.route('/')
async def main_route():
    return "hello"