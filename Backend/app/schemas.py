from pydantic import BaseModel, Field

class PingResponse(BaseModel):
    status: str = Field(default="ok")

class UploadResponse(BaseModel):
    name: str
    size: int
