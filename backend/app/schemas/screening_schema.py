from typing import List

from pydantic import (
    BaseModel,
    Field
)


class ScreeningResult(BaseModel):

    match_score: float = Field(
        ge=0,
        le=100
    )

    matched_skills: List[str]

    missing_skills: List[str]

    strengths: List[str]

    recommendation: str

    justification: str


class BatchScreeningRequest(BaseModel):

    job_id: str

    candidate_ids: List[str]


class RankedCandidate(BaseModel):

    rank: int

    candidate_id: str

    candidate_name: str

    match_score: float = Field(
        ge=0,
        le=100
    )

    recommendation: str

    matched_skills: List[str]

    missing_skills: List[str]


class BatchScreeningResponse(BaseModel):

    job_id: str

    job_title: str

    total_candidates: int

    shortlisted: int

    candidates: List[RankedCandidate]