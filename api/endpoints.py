import quart
from model.message import MessagePayload  # pylint: disable=import-error
from quart import Blueprint, request, session, g
import api.gateway  # pylint: disable=import-error
import api.status_codes  # pylint: disable=import-error
api_blueprint = Blueprint('api', __name__)
api_blueprint.register_blueprint(api.gateway.gateway_blueprint, url_prefix="/gateway")


@api_blueprint.route("/channel/<int:channel_id>", methods=["GET"])
async def get_channel(channel_id: int):
    if channel_id:
        channel = await g.db.channels(channel_id=channel_id)
        if channel:
            return channel.gateway_format
        else:
            return api.status_codes.NotFound()
    return api.status_codes.BadRequest()


@api_blueprint.route("/channel/<int:channel_id>/message", methods=["POST"])
async def create_message(channel_id: int):
    if channel_id:
        form = await request.form
        if 'message' in form:
            msg = form['message']
            token = session.get('token')
            if token:
                channel = await g.db.channels(channel_id=channel_id)
                member = await g.db.members(token=token)
                if member and channel:
                    mpl = MessagePayload(msg, member, channel)
                    await channel.send(mpl)
                    return api.status_codes.OK()
    return api.status_codes.BadRequest()


@api_blueprint.route("/message/<int:message_id>", methods=["PUT", "DELETE", "PATCH"])
async def message_modify(message_id):
    if message_id and session.get('token'):
        token = session.get('token')
        member = await g.db.members(token=token)
        message = await g.db.messages(message_id=message_id)
        if message.author.id == member.id:
            if request.method == "PATCH":
                form = await request.form
                content = form.get('content')
                if content:
                    await message.edit(content)
                    return api.status_codes.OK()

            elif request.method == "PUT":
                form = await request.form
                content = form.get('content')
                if content:
                    await message.edit(content)
                    return api.status_codes.OK()
            elif request.method == "DELETE":
                await message.delete()
                return api.status_codes.OK()
    return api.status_codes.BadRequest()


@api_blueprint.route("/server/<int:server_id>/join")
async def join_server(server_id):
    token = session.get("token")
    if token:
        member = await g.db.members(token=token)
        if member:
            server = await g.db.servers(server_id=server_id)
            if server:
                await member.join_server(server)
                return api.status_codes.OK()
    return api.status_codes.BadRequest()


@api_blueprint.route("/server/<int:server_id>/leave")
async def leave_server(server_id):
    token = session.get("token")
    if token:
        member = await g.db.members(token=token)
        if member:
            server = await g.db.servers(server_id=server_id)
            if server:
                await member.remove_from_server(server)
                return api.status_codes.OK()
    return api.status_codes.BadRequest()


@api_blueprint.route("/server/<int:server_id>/join/<int:member_id>")
async def join_server_test(server_id, member_id):

    member = await g.db.members(member_id=member_id)
    if member:
        server = await g.db.servers(server_id=server_id)
        if server:
            await member.join_server(server)
            return api.status_codes.OK()
    return api.status_codes.BadRequest()


@api_blueprint.route("/server/<int:server_id>/leave/<int:member_id>")
async def leave_server_test(server_id, member_id):

    member = await g.db.members(member_id=member_id)
    if member:
        server = await g.db.servers(server_id=server_id)
        if server:
            await member.remove_from_server(server)
            return api.status_codes.OK()
    return api.status_codes.BadRequest()


@api_blueprint.route("/server", methods=['POST'])
async def create_server():
    token = session.get('token')
    if token:
        form = await request.form
        if form:
            name = form.get('name')
            if name:
                member = await g.db.members(token=token)
                if member:
                    await member.create_server(name)
                    return api.status_codes.OK()
    return api.status_codes.BadRequest()


@api_blueprint.route('/channel/<int:channel_id>/messages', methods=["GET"])
async def get_messages(channel_id: int):
    if session.get('token'):
        channel = await g.db.channels(channel_id=channel_id)
        if channel:
            messages = await channel.messages()
            if messages:
                return quart.jsonify([x.gateway_format for x in messages])
            else:
                return api.status_codes.NotFound()
    return api.status_codes.BadRequest()


@api_blueprint.route('/server/<int:server_id>', methods=["GET"])
async def get_server(server_id: int):
    if server_id:
        server = await g.db.servers(server_id=server_id)
        if server:
            return server.gateway_format
        else:
            return api.status_codes.NotFound()
    return api.status_codes.BadRequest()


@api_blueprint.route('/server/<int:server_id>/channel', methods=["POST"])
async def create_channel(server_id: int) -> None:
    token = session.get('token')
    if server_id and token:
        form = await request.form
        if 'type' in form and 'name' in form:
            member = await g.db.members(token=token)
            server = await g.db.servers(server_id=server_id)
            if member and server:
                await server.create_channel(form['name'], form['type'])
                return api.status_codes.OK()
    return api.status_codes.BadRequest()


@api_blueprint.route('/server/<int:server_id>/channels', methods=['GET'])
async def get_server_channels(server_id: int):
    if server_id:
        server = await g.db.servers(server_id=server_id)
        if server:
            await server.load_channels()
            channels = [x.gateway_format for x in server.channels.values()]
            return quart.jsonify(channels)
        else:
            return api.status_codes.NotFound()
    return api.status_codes.BadRequest()


# @api_blueprint.route('/test')
# async def test1():
#     mem2 = database.members["id"][1]
#     mem1 = database.members["id"][3]
#     ser = database.servers[1]
#     chan = database.channels["all"][2]
#     print(chan.messages)
#     print(ser, ser.channels)
#     return "test1"

# @api_blueprint.route('/cmdtvt_debug/<int:member_id>/')
# async def test_createserver(member_id):
#     member = await database.servers(server_id=member_id)
#     if member:
#         server = await database.create_server_channel("New channel", "text", member)
#         return "Server channel created: "+server.name+" | "+str(server.id)
#     else:
#         return "aw snap cmdtvt coded something wrong -_-"


# @api_blueprint.route('/message/test2/<token>/<int:channel_id>/<message>')
# async def test2(token, channel_id, message):
#     if token in database.members["token"] and channel_id in database.channels:
#         member = database.members["token"][token]
#         channel = database.channels[channel_id]
#         await member.send(message, channel)
#     return "hello"
