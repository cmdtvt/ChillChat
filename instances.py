from db import DB_API
from utilities import Cache

database = DB_API("127.0.0.1", "chillchat", "chillarandgrillar", "chillchat", 5432)
cache = Cache()
