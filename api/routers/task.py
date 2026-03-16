from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import api.schemas.task as task_schema
import api.cruds.task as task_crud
from api.db import get_db

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)


@router.get("", response_model=list[task_schema.Task])
async def list_tasks(db: AsyncSession = Depends(get_db)):
    return await task_crud.get_tasks_with_done(db)


@router.post("", response_model=task_schema.TaskCreateResponse)
async def create_task(task_body: task_schema.TaskCreate,
                      db: AsyncSession = Depends(get_db)):
    return await task_crud.create_task(db, task_body)


@router.put("/{task_id}", response_model=task_schema.TaskCreateResponse)
async def update_task(
                task_id: int,
                task_body: task_schema.TaskCreate,
                db: AsyncSession = Depends(get_db)
            ):
    task = await task_crud.get_task(db, task_id=task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return await task_crud.update_task(db, task_body, original=task)


# @router.put("/tasks/{task_id}/done", response_model=None)
# async def mark_task_as_done(
#       task_id: int,
#       db: AsyncSession = Depends(get_db),
#       ):
#     task = await task_crud.get_task(db, task_id=task_id)
#     if task is None:
#         raise HTTPException(status_code=404, detail="Task not found")
#     # Implementation for marking task as done would go here
#     return


# @router.delete("/tasks/{task_id}/done", response_model=None)
# async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
#     task = await task_crud.get_task(db, task_id=task_id)
#     if task is None:
#         raise HTTPException(status_code=404, detail="Task not found")
#     # Implementation for deleting task would go here
#     return
