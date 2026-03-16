from pydantic import BaseModel


class DoneResponse(BaseModel):
    id: int
    model_config = {"from_attributes": True}
