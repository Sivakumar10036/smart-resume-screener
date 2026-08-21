from pydantic import BaseModel


class JobDescriptionCreate(BaseModel):

    title: str

    description: str