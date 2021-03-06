from datetime import datetime
from typing import Optional, Sequence, Any, Union
import asyncpg
import os
import binascii
from markupsafe import escape
import argon2

import utilities
from model.abc import DBAPIBase, ClientBase
from model.message import MessagePayload, Message
from model.member import Member
from model.channel import Channel, TextChannel
from model.server import Server

cache = utilities.Cache()


class DBAPI(DBAPIBase):

    def __init__(self: DBAPIBase,
                 host: str,
                 username: str,
                 password: str,
                 database: str,
                 port: int = 5432) -> None:
        self.host: str = host
        self.username: str = username
        self.password: str = password
        self.database: str = database
        self.port: int = port
        self.queries: dict[str, str] = {
            "INSERT": "INSERT INTO {table} ({columns}) VALUES ({values})",
            "INSERT_RETURNING": "INSERT INTO {table} ({columns}) VALUES ({values}) RETURNING {returning}",
            "SELECT_ALL": "SELECT * FROM {table}",
            "SELECT_ALL_ORDER": "SELECT * FROM {table} ORDER BY {order}",
            "SELECT_WHERE": "SELECT * FROM {table} WHERE {where}",
            "SELECT_WHERE_ORDER": "SELECT * FROM {table} WHERE {where} ORDER BY {order}",
            "SELECT_JOIN": "SELECT {columns} FROM {table1} JOIN {table2} WHERE {where}",
            "DELETE": "DELETE FROM {table} WHERE {where}",
            "UPDATE": "UPDATE {table} SET {values} WHERE {where}",
        }
        self.pool = None
        self.clients: dict[str, dict[str, ClientBase]] = {"tokenized": {}, "all": set(), "id": {}}
        Server.database = self
        Channel.database = self
        Member.database = self
        Message.database = self
        self.hasher = argon2.PasswordHasher(time_cost=6,
                                            memory_cost=64000,
                                            parallelism=2,
                                            hash_len=100,
                                            salt_len=50
                                            )

    def create_token(self: DBAPIBase,) -> str:
        return binascii.b2a_hex(os.urandom(50)).decode('utf8')

    def create_password(self: DBAPIBase, password: str) -> str:
        return self.hasher.hash(password)

    def verify_password(self: DBAPIBase, password_hash: str, password: str):
        try:
            return self.hasher.verify(password_hash, password)
        except Exception:
            return False

    @cache.async_cached(timeout=5)
    async def members(self: DBAPIBase,
                      *,
                      token: str = None,
                      member_id: int = None,
                      username: str = None
                      ) -> Optional[Union[Member, tuple]]:
        if token or member_id or username:
            member_data = None
            if token:
                member_data = await self.query(self.queries["SELECT_WHERE"].format(
                    table="member",
                    where="token=$1::text LIMIT 1"
                ), (token,))
            elif member_id:
                member_data = await self.query(self.queries["SELECT_WHERE"].format(
                    table="member",
                    where="id=$1::BIGINT LIMIT 1"
                ), (member_id,))
            elif username:

                username = username.lower()
                member_data = await self.query(self.queries["SELECT_WHERE"].format(
                    table="member",
                    where="LOWER(name)=$1::text LIMIT 1"
                ), (username,))
                print(username, member_data)
                if member_data:
                    member_data = member_data[0]
                    member = Member(member_data["id"], member_data["name"], member_data["token"], member_data["avatar"])
                    return member, member_data["password"]
                else:
                    return None, None
            if member_data:
                member_data = member_data[0]
                member = Member(member_data["id"], member_data["name"], member_data["token"], member_data["avatar"])
                await member.get_permissions()
                return member
        return None

    @cache.async_cached(timeout=5)
    async def cached_query(self: DBAPIBase, query, params):
        print(query, params)
        return await self.query(query, params)

    @cache.async_cached(timeout=5)
    async def channels(self: DBAPIBase, *, channel_id: int = None) -> Optional[Channel]:
        if channel_id:
            channel_data = await self.query(self.queries["SELECT_WHERE"].format(
                table="channel",
                where="id=$1::BIGINT LIMIT 1",
            ), (channel_id,))
            if channel_data:
                channel_data = channel_data[0]
                if channel_data["type"] == "text":
                    server_qr = await self.query(self.queries["SELECT_WHERE"].format(
                        table="server_channels",
                        where="channel_id=$1::BIGINT"
                    ), (channel_id,))
                    server = None
                    if server_qr:
                        server_qr = server_qr[0]
                        server = await self.servers(server_id=server_qr["server_id"])
                    return TextChannel(channel_data["id"], channel_data["name"], server, channel_data["permissions"])
        return None

    @cache.async_cached(timeout=5)
    async def servers(self: DBAPIBase, *, server_id: int = None) -> Optional[Server]:
        if server_id:
            server_data = await self.query(self.queries["SELECT_WHERE"].format(
                table="server",
                where="id=$1::BIGINT LIMIT 1",
            ), (server_id,))
            if server_data:
                server_data = server_data[0]
                return Server(server_data["id"], server_data["name"], server_data["icon"], server_data["permissions"])

    @cache.async_cached(timeout=5)
    async def messages(self: DBAPIBase, *, message_id: int = None) -> Optional[Message]:
        if message_id:
            message_data = await self.query(self.queries["SELECT_WHERE"].format(
                table="message",
                where="id=$1::BIGINT LIMIT 1",
            ), (message_id,))
            if message_data:
                message_data = message_data[0]
                author = await self.members(member_id=message_data["author_id"])
                channel = await self.channels(channel_id=message_data["channel_id"])
                if author and channel:
                    return Message(message_id, message_data["content"], author, channel, message_data["timestamp"])

    async def create_member(self: DBAPIBase, name: str, avatar: str) -> Member:
        qr = await self.query(self.queries["INSERT_RETURNING"].format(table="member",
                                                                      columns="name, avatar",
                                                                      values="$1::text, $2::text",
                                                                      returning="id"), (name, avatar))
        return Member(qr, name, None, avatar, own_channel=None, servers=None, roles=None, permissions=None)

    async def remove_from_server(self: DBAPIBase, member: Member, server: Server) -> None:
        await self.query(self.queries["DELETE"].format(
            table="server_members",
            where="member_id=$1::bigint AND server_id=$2::bigint",
        ), (member.id, server.id))

    async def join_server(self: DBAPIBase, member: Member, server: Server) -> None:
        await self.query(self.queries["INSERT"].format(
            table="server_members",
            columns="member_id, server_id",
            values="$1::bigint, $2::bigint"
        ), (member.id, server.id))

    async def create_server(self: DBAPIBase, name: str, owner: Member) -> Server:
        qr = await self.query(self.queries["INSERT_RETURNING"].format(table="server",
                                                                      columns="name, owner",
                                                                      values="$1::text, $2::bigint",
                                                                      returning="id"), (name, owner.id))
        result = Server(qr[0]["id"], name)
        result.owner = owner
        await self.join_server(owner, result)
        return result

    async def delete_server(self: DBAPIBase, server: Server) -> bool:
        await self.query(self.queries["DELETE"].format(table="server", where="id=$1::bigint"), (server.id,))
        key = utilities.Cache.generate_key(server_id=server.id)
        cache.invalidate(self.servers, key)

    async def create_server_channel(self: DBAPIBase, name: str, channel_type: str, server: Server) -> Channel:
        qr = await self.query(self.queries["INSERT_RETURNING"].format(table="channel",
                                                                      columns="name, type",
                                                                      values="$1::text, $2::text",
                                                                      returning="id"), (name, channel_type))
        await self.query(self.queries["INSERT"].format(table="server_channels",
                                                       columns="channel_id, server_id",
                                                       values="$1::bigint, $2::bigint"), (qr[0]["id"], server.id))
        channel = None
        if channel_type == "text":
            channel = TextChannel(qr[0]["id"], name, server)
        server.channels[channel.id] = channel
        return channel

    async def create_message(self: DBAPIBase, payload: MessagePayload) -> Message:
        content = escape(payload.content)
        message_id = await self.query(self.queries["INSERT_RETURNING"].format(
            table="message",
            columns="content, author_id, channel_id, timestamp",
            values="$1::text, $2::bigint, $3::bigint, $4::timestamp with time zone",
            returning="id"
        ), (content, payload.author.id, payload.channel.id, datetime.utcnow()))
        message = Message(message_id[0]["id"], content, payload.author, payload.channel)
        return message

    async def edit_message(self: DBAPIBase, message: Message, content: str) -> Message:
        content = escape(content)
        await self.query(
            self.queries["UPDATE"].format(
                table="message",
                values="content=$1::text",
                where="id=$2::bigint"
            ), (content, message.id)
        )
        message.content = content
        return message

    async def delete_message(self: DBAPIBase, message: Message) -> bool:
        await self.query(
            self.queries["DELETE"].format(
                table="message",
                where="id=$1::bigint"

            ), (message.id,)
        )
        return True

    async def query(self: DBAPIBase,
                    sql: str,
                    params: Optional[Sequence[Any]] = None) -> Optional[Sequence[Any]]:
        if self.pool is None:
            self.pool = await asyncpg.create_pool(user=self.username,
                                                  password=self.password,
                                                  database=self.database,
                                                  host=self.host)
        conn = await self.pool.acquire()
        try:
            if sql.startswith("SELECT") or sql.endswith("RETURNING id"):
                if params:
                    return await conn.fetch(sql, *params)
                else:
                    return await conn.fetch(sql,)
            else:
                if params:
                    await conn.execute(sql, *params)
                else:
                    await conn.execute(sql)
        finally:
            try:
                await self.pool.release(conn)
            except Exception as e:
                print(e)
    # async def load_all(self,):
    #     servers = {}
    #     qr_servers = await self.query(self.queries["SELECT_ALL"].format(table="server"))
    #     channels = await self.load_channels()
    #     members = await self.load_members()
    #     await self.load_messages(channels, members)
    #     for row in qr_servers:
    #         servers[row["id"]] = Server(row["id"], row["name"])

    #         servers[row["id"]].owner = members[row["owner"]]
    #         servers[row["id"]].channels = channels["server"].get(row["id"]) or {}
    #         for id, channel in servers[row["id"]].channels.items():
    #             channel.server = servers[row["id"]]
    #     await self.server_member_relationships(servers, members)
    #     self.channels = channels
    #     self.members["id"] = members
    #     self.servers = servers
    # async def server_member_relationships(self, servers: dict[int, Server], members: dict[int, Member]) -> None:
    #     member_server_relationships = await self.query(self.queries["SELECT_ALL"].format(table="server_members"))
    #     for row in member_server_relationships:
    #         servers[row["server_id"]].members[row["member_id"]] = members[row["member_id"]]
    #         members[row["member_id"]].servers[row["server_id"]] = servers[row["server_id"]]
    # async def load_channels(self,) -> dict[int, dict[int,Channel]]:
    #     channels = {"server": {}, "member": {}, "all": {}}
    #     qr = await self.query(self.queries["SELECT_ALL"].format(table="channel"))
    #     qr_server = await self.query(self.queries["SELECT_ALL"].format(table="server_channels"))
    #     for row in qr:
    #         # if row["server"] not in channels:
    #         #     channels[row["server"]] = {}
    #         channel = None
    #         if row["type"] == "text":
    #             channel = TextChannel(row["id"], row["name"])
    #         channels["all"][row["id"]] = channel
    #         # channels[row["server"]][row["id"]] = channel
    #         # self.channels["server"][row["id"]] = channel
    #     for row in qr_server:
    #         if row["server_id"] not in channels["server"]:
    #             channels["server"][row["server_id"]] = {}
    #         channels["server"][row["server_id"]][row["channel_id"]] = channels["all"][row["channel_id"]]
    #     return channels

    #     async def load_members(self,):
    #     members = {}
    #     qr_channel_permissions =
    # await self.query(self.queries["SELECT_ALL"].format(table="member_channel_permissions"))
    #     qr_server_permissions = await self.query(self.queries["SELECT_ALL"].format(table="member_server_permissions"))
    #     permissions = {"server": {}, "channel": {}}
    #     for row in qr_channel_permissions:
    #         if row["member_id"] not in permissions["channel"]:
    #             permissions["channel"][row["member_id"]] = {}
    #         if row["channel_id"] not in permissions["channel"][row["member_id"]]:
    #             permissions["channel"][row["member_id"]][row["channel_id"]] = ChannelPermissions()
    #         if row["enabled"]:
    #             permissions["channel"][row["member_id"]][row["channel_id"]].enable(row["name"])
    #         else:
    #             permissions["channel"][row["member_id"]][row["channel_id"]].disable(row["name"])
    #     for row in qr_server_permissions:
    #         if row["member_id"] not in permissions["server"]:
    #             permissions["server"][row["member_id"]] = {}
    #         if row["server_id"] not in permissions["server"][row["member_id"]]:
    #             permissions["server"][row["member_id"]][row["server_id"]] = ServerPermissions()
    #         if row["enabled"]:
    #             permissions["server"][row["member_id"]][row["server_id"]].enable(row["name"])
    #         else:
    #             permissions["server"][row["member_id"]][row["server_id"]].disable(row["name"])
    #     qr = await self.query(self.queries["SELECT_ALL"].format(table="member"))
    #     for row in qr:
    #         channel_perms = permissions["channel"].get(row["id"])
    #         server_perms = permissions["server"].get(row["id"])
    #         member = Member(row["id"], row["name"],"", row["avatar"], None, {}, {},
    # {"channel": channel_perms, "server": server_perms})
    #         members[row["id"]] = member
    #     return members
    # async def load_messages(self, channels: dict[int, Channel], members: dict[int, Member]):
    #     qr_messages = await self.query(self.queries["SELECT_ALL"].format(table="message"))
    #     for row in qr_messages:
    #         channels["all"][row["channel_id"]].messages.append(Message(row["id"],
    # row["content"], members[row["author_id"]],
    # channels["all"][row["channel_id"]]))
    #         print(channels["all"][row["channel_id"]].messages)
