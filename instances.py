from fake_db import Db
import api.gateway
database = Db
api.gateway.database = database