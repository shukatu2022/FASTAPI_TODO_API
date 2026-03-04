from fastapi import FastAPI

from api.routers import task, done

app = FastAPI()
app.include_router(task.router)
app.include_router(done.router)


@app.get("/")
async def read_root():
    return {"message": "Hello, FastAPI in Docker!"}
