import datetime
from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str | None = Field(None, examples=["クリーニングを取りに行く"])
    due_date: datetime.date | None = Field(
        None,
        json_schema_extra={"example": "2026-04-01"}
        )


class TaskCreate(TaskBase):
    pass


class TaskCreateResponse(TaskBase):
    id: int
    model_config = {"from_attributes": True}

    # orm_mode = True 非推奨の為 model_config
    # class Config:
    #     orm_mode = True


class Task(TaskBase):
    id: int
    done: bool = Field(False, description="完了フラグ")
    model_config = {"from_attributes": True}

    # orm_mode = True 非推奨の為 model_config
    # class Config:
    #     orm_mode = True
