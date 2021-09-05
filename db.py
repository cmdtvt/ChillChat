from typing import Optional, Sequence, Any
import asyncio
import os, binascii

import psycopg2, psycopg2.extras
from model.permissions import ChannelPermissions, ServerPermissions
from model.message import MessagePayload, Message
from model.member import Member
from model.channel import Channel, TextChannel
from model.server import Server

class Database:
    def __init__(self, host : str, username : str, password :str, database : str, port : int=5432) -> None:
        self._dbo = psycopg2.connect(host=host, user=username, password=password, database=database, port=port)
        self.queries = {
            "INSERT" : "INSERT INTO {table} ({columns}) VALUES ({values})",
            "INSERT_RETURNING" : "INSERT INTO {table} ({columns}) VALUES ({values}) RETURNING {returning}",
            "SELECT_ALL" : "SELECT * FROM {table}"
        }
        
    def query(self, sql : str, params : Optional[Sequence[Any]]=None) -> Optional[psycopg2.extras.RealDictRow]:
        try:
            data = None
            if params is None:
                params = ()
            with self._dbo.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(sql, params)
                if sql.startswith("SELECT"):
                    data = cursor.fetchall() or []
                elif "RETURNING" in sql:
                    data = cursor.fetchone()["id"]
            self._dbo.commit()
            if data is not None:
                return data
        except Exception as e:
            print(e)
            self._dbo.rollback()
class DB_API(Database):
    def __init__(self, host : str, username : str, password :str, database : str, port : int=5432) -> None:
        super().__init__(host, username, password, database, port)
        self.members = {"token" : {}, "id" : {}}
        self.servers = {}
        self.channels = {"server" : {}, "member" : {}}
        self.roles = {}
        Server.database = self
        TextChannel.database = self
        Member.database = self
    def create_token(self, member : Member) -> None:
        if member.token:
            del self.members["token"][member.token]
            member.token = None
        token = binascii.b2a_hex(os.urandom(50)).decode('utf8')
        member.token = token
        self.members["token"][token] = member
    async def query(self, sql : str, params : Optional[Sequence[Any]]=None) -> Optional[psycopg2.extras.RealDictRow]:
        result = await asyncio.get_event_loop().run_in_executor(None, super().query, sql, params)
        return result
    async def create_message(self, payload : MessagePayload) -> Message:
        message_id = await self.query(self.queries["INSERT_RETURNING"].format(
            table="message",
            columns="content, author_id, channel_id",
            values="%s, %s, %s",
            returning="id"
        ), (payload.content, payload.author.id, payload.channel.id))
        message = Message(message_id, payload.content, payload.author, payload.channel)
        return message
    async def load_all(self,):
        servers = {}
        qr_servers = await self.query(self.queries["SELECT_ALL"].format(table="server"))
        
        channels = await self.load_channels()
        members = await self.load_members()
        for row in qr_servers:
            servers[row["id"]] = Server(row["id"], row["name"])

            servers[row["id"]].owner = members[row["owner"]]
            servers[row["id"]].channels = channels["server"].get(row["id"]) or {}
            for id, channel in servers[row["id"]].channels.items():
                channel.server = servers[row["id"]]
        await self.server_member_relationships(servers, members)
        self.channels = channels
        self.members["id"] = members
        self.servers = servers
    async def server_member_relationships(self, servers : dict[int, Server], members : dict[int, Member]) -> None:
        member_server_relationships = await self.query(self.queries["SELECT_ALL"].format(table="server_members"))
        for row in member_server_relationships:
            servers[row["server_id"]].members[row["member_id"]] = members[row["member_id"]]
            members[row["member_id"]].servers[row["server_id"]] = servers[row["server_id"]]
    async def load_channels(self,) -> dict[int, dict[int,Channel]]:
        channels = {"server" : {}, "member" : {}, "all" : {}}
        qr = await self.query(self.queries["SELECT_ALL"].format(table="channel"))
        qr_server = await self.query(self.queries["SELECT_ALL"].format(table="server_channels"))
        for row in qr:
            # if row["server"] not in channels:
            #     channels[row["server"]] = {}
            channel = None
            if row["type"] == "text":
                channel = TextChannel(row["id"], row["name"], None, None)
            channels["all"][row["id"]] = channel
        
            # channels[row["server"]][row["id"]] = channel
            # self.channels["server"][row["id"]] = channel
        for row in qr_server:
            if row["server_id"] not in channels["server"]:
                channels["server"][row["server_id"]] = {}
            channels["server"][row["server_id"]][row["channel_id"]] = channels["all"][row["channel_id"]] 
        return channels
    async def load_members(self,):
        members = {}
        qr_channel_permissions = await self.query(self.queries["SELECT_ALL"].format(table="member_channel_permissions"))
        qr_server_permissions = await self.query(self.queries["SELECT_ALL"].format(table="member_server_permissions"))
        permissions = {"server" : {}, "channel" : {}}
        for row in qr_channel_permissions:
            if row["member_id"] not in permissions["channel"]:
                permissions["channel"][row["member_id"]] = {}
            if row["channel_id"] not in permissions["channel"][row["member_id"]]:
                permissions["channel"][row["member_id"]][row["channel_id"]] = ChannelPermissions()
            
            if row["enabled"]:
                permissions["channel"][row["member_id"]][row["channel_id"]].enable(row["name"])
            else:
                permissions["channel"][row["member_id"]][row["channel_id"]].disable(row["name"])
        for row in qr_server_permissions:
            if row["member_id"] not in permissions["server"]:
                permissions["server"][row["member_id"]] = {}
            if row["server_id"] not in permissions["server"][row["member_id"]]:
                permissions["server"][row["member_id"]][row["server_id"]] = ServerPermissions()
            
            if row["enabled"]:
                permissions["server"][row["member_id"]][row["server_id"]].enable(row["name"])
            else:
                permissions["server"][row["member_id"]][row["server_id"]].disable(row["name"])
        qr = await self.query(self.queries["SELECT_ALL"].format(table="member"))
        for row in qr:
            channel_perms = permissions["channel"].get(row["id"])
            server_perms = permissions["server"].get(row["id"])

            member = Member(row["id"], row["name"],"", row["avatar"], None, {}, {}, {"channel" : channel_perms, "server" : server_perms})
            members[row["id"]] = member
        return members
    async def join_server(self, member : Member, server : Server) -> None:
        qr = await self.query(self.queries["INSERT"].format(table="server_members", columns="member_id, server_id", values="%s, %s"), (member.id, server.id))
        server.members[member.id] = member
        member.servers[server.id] = server
    async def create_member(self, name : str, avatar : str) -> Member:
        qr = await self.query(self.queries["INSERT_RETURNING"].format(table="member", columns="name, avatar", values="%s, %s", returning="id"), (name, avatar))
        return Member(qr, name, None, avatar, None, {}, {}, {})
    async def create_server(self, name : str, owner : Member) -> Server:
        qr = await self.query(self.queries["INSERT_RETURNING"].format(table="server", columns="name, owner", values="%s, %s", returning="id"), (name, owner.id))
        result = Server(qr, name)
        result.owner = owner
        await self.join_server(owner, result)
        return result
    async def create_server_channel(self, name : str, channel_type : str, server : Server) -> Channel:
        qr = await self.query(self.queries["INSERT_RETURNING"].format(table="channel", columns="name, type", values="%s, %s", returning="id"), (name, channel_type))
        qr_server = await self.query(self.queries["INSERT"].format(table="server_channels", columns="channel_id, server_id", values="%s, %s"), (qr, server.id))
        channel = None
        if channel_type == "text":
            channel = TextChannel(qr, name, server, [])
        server.channels[channel.id] = channel
        return channel
