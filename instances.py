from db import DBAPI
from utilities import Cache

database = DBAPI("127.0.0.1", "chillchat", "chillarandgrillar", "chillchat", 5432)
cache = Cache()
