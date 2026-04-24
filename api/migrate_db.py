import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from api.models.task import Base

ASYNC_DB_URL = os.environ["DATABASE_URL"]
engine = create_async_engine(ASYNC_DB_URL, echo=True)


async def reset_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(reset_database())

# 以下は mysql 用
# ASYNC_DB_URL = "mysql+aiomysql://root@db:3306/demo?charset=utf8"
# engine = create_async_engine(ASYNC_DB_URL, echo=True
# from sqlalchemy import create_engine
# from models.task import Base


# DB_URL = "mysql+pymysql://root@db:3306/demo?charset=utf8"
# engine = create_engine(DB_URL, echo=True)


# # 毎回データを消去(後で削除すること)
# def reset_database():
#     Base.metadata.drop_all(bind=engine)
#     Base.metadata.create_all(bind=engine)


# if __name__ == "__main__":
#     reset_database()
