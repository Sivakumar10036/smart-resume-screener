from typing import List

from pydantic import BaseModel


class Experience(BaseModel):

    company: str

    role: str

    duration: str

    description: str


class Education(BaseModel):

    degree: str

    field: str

    institution: str

    year: str


class CandidateProfile(BaseModel):

    name: str

    email: str

    phone: str

    skills: List[str]

    education: List[Education]

    experience: List[Experience]