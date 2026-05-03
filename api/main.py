# render で deploy するためのコード
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.routers import task, done, auth
from api.db import async_engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(auth.router)
app.include_router(task.router)
app.include_router(done.router)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def read_index():
    return FileResponse("static/index.html")


# ローカルで動かすためのコード
# from fastapi import FastAPI
# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import FileResponse

# from api.routers import task, done

# app = FastAPI()
# app.include_router(task.router)
# app.include_router(done.router)

# app.mount("/static", StaticFiles(directory="static"), name="static")


# @app.get("/")
# async def read_index():
#     return FileResponse("static/index.html")
