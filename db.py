from typing import Optional, Sequence, Any

import psycopg2, psycopg2.extras
from model.permissions import ChannelPermissions, ServerPermissions
from model.message import MessagePayload, Message
from model.member import Member
from model.channel import TextChannel
from model.server import Server
from utilities import run_in_executor

class Database:
    def __init__(self, host : str, username : str, password :str, database : str, port : int=5432) -> None:
        self._dbo = psycopg2.connect(host=host, user=username, password=password, database=database, port=port)
        self.queries = {
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
                if "SELECT" in sql:
                    data = cursor.fetchall()
                elif "RETURNING" in sql:
                    data = cursor.fetchone()
            self._dbo.commit()
            if data:
                return data
        except Exception as e:
            print(e)
            self._dbo.rollback()
class DB_API(Database):
    def __init__(self, host : str, username : str, password :str, database : str, port : int=5432) -> None:
        super().__init__(host, username, password, database, port)
        self.members = {"token" : {}, "id" : {}}
        self.servers = {}
        self.channels = {}
        self.roles = {}
    @run_in_executor()
    def query(self, sql : str) -> Optional[psycopg2.extras.RealDictRow]:
        return super().query(sql)
    async def create_message(self, payload : MessagePayload) -> Message:
        message_id = await self.query(self.queries["INSERT_RETURNING"].format(
            table="message",
            columns="content, author_id, channel_id",
            values="%s %s %s",
            returning="id"
        ), (payload.content, payload.author.id, payload.channel.id))
        message = Message(message_id, payload.content, payload.author, payload.channel)
        return message
    async def load_members(self,):
        members = {}
        qr_permissions = await self.query(self.queries["SELECT_ALL"].format(
            table="member_permissions"
        ))
        permissions = {"server" : {}, "channel" : {}}
        for row in qr_permissions:
            if row["member_id"] not in permissions[row["type"]]:
                permission = None
                if row["type"] == "server":
                    permission = ServerPermissions()
                elif row["type"] == "channel":
                    permission = ChannelPermissions()
                
                if permission is not None:
                    permissions[row["type"]][row["member_id"]] = permission
            
            if row["enabled"]:
                permissions[row["type"]][row["member_id"]].toggle(row["name"])
        qr = await self.query(self.queries["SELECT_ALL"].format(
            table="member"
        ))
        for i in qr:
            channel_perms = permissions["channel"][row["id"]]
            server_perms = permissions["server"][row["id"]]

            member = Member(row["id"], row["name"],"", row["avatar"], None, {}, {}, {"channel" : channel_perms, "server" : server_perms})
            members[row["id"]] = member


