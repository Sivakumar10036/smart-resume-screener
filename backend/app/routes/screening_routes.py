from datetime import datetime, timezone
from io import BytesIO

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from fastapi.responses import StreamingResponse

from openpyxl import Workbook

from openpyxl.styles import (
    Font,
    Alignment,
    PatternFill,
    Border,
    Side
)

from app.config import settings

from app.database import (
    candidates_collection,
    jobs_collection,
    screening_results_collection
)

from app.schemas.screening_schema import (
    BatchScreeningRequest
)

from app.services.matcher import (
    match_resume_with_job
)

from app.utils.security import (
    require_roles
)


router = APIRouter(
    prefix="/api/screening",
    tags=["Screening"]
)


def get_recommendation(
    score
):

    if score >= settings.shortlist_threshold:

        return "SHORTLIST"

    if score >= settings.review_threshold:

        return "REVIEW"

    return "REJECT"


@router.post("/match")
def match_candidate(
    candidate_id: str,
    job_id: str,
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    try:

        candidate = (
            candidates_collection
            .find_one(
                {
                    "_id":
                        ObjectId(
                            candidate_id
                        )
                }
            )
        )

        job = (
            jobs_collection
            .find_one(
                {
                    "_id":
                        ObjectId(
                            job_id
                        )
                }
            )
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid candidate or job ID"
        )

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job description not found"
        )

    result = (
        match_resume_with_job(
            candidate,
            job
        )
    )

    score = float(
        result["match_score"]
    )

    recommendation = (
        get_recommendation(
            score
        )
    )

    screening_document = {

        "candidate_id":
            candidate["_id"],

        "job_id":
            job["_id"],

        "match_score":
            score,

        "matched_skills":
            result.get(
                "matched_skills",
                []
            ),

        "missing_skills":
            result.get(
                "missing_skills",
                []
            ),

        "strengths":
            result.get(
                "strengths",
                []
            ),

        "recommendation":
            recommendation,

        "justification":
            result.get(
                "justification",
                ""
            ),

        "screened_by":
            str(
                current_user["_id"]
            ),

        "screened_by_username":
            current_user.get(
                "username",
                ""
            ),

        "created_at":
            datetime.now(
                timezone.utc
            )
    }

    database_result = (
        screening_results_collection
        .insert_one(
            screening_document
        )
    )

    result["recommendation"] = (
        recommendation
    )

    return {

        "message":
            "Candidate screening completed",

        "screening_id":
            str(
                database_result.inserted_id
            ),

        "candidate":
            candidate.get(
                "name",
                ""
            ),

        "job":
            job.get(
                "title",
                ""
            ),

        "result":
            result
    }


@router.post("/batch")
def batch_screen_candidates(
    request: BatchScreeningRequest,
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    try:

        job = (
            jobs_collection
            .find_one(
                {
                    "_id":
                        ObjectId(
                            request.job_id
                        )
                }
            )
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job description not found"
        )

    ranked_candidates = []

    for candidate_id in request.candidate_ids:

        try:

            candidate = (
                candidates_collection
                .find_one(
                    {
                        "_id":
                            ObjectId(
                                candidate_id
                            )
                    }
                )
            )

        except Exception:

            continue

        if not candidate:

            continue

        result = (
            match_resume_with_job(
                candidate,
                job
            )
        )

        score = float(
            result["match_score"]
        )

        recommendation = (
            get_recommendation(
                score
            )
        )

        screening_document = {

            "candidate_id":
                candidate["_id"],

            "job_id":
                job["_id"],

            "match_score":
                score,

            "matched_skills":
                result.get(
                    "matched_skills",
                    []
                ),

            "missing_skills":
                result.get(
                    "missing_skills",
                    []
                ),

            "strengths":
                result.get(
                    "strengths",
                    []
                ),

            "recommendation":
                recommendation,

            "justification":
                result.get(
                    "justification",
                    ""
                ),

            "screened_by":
                str(
                    current_user["_id"]
                ),

            "screened_by_username":
                current_user.get(
                    "username",
                    ""
                ),

            "created_at":
                datetime.now(
                    timezone.utc
                )
        }

        database_result = (
            screening_results_collection
            .insert_one(
                screening_document
            )
        )

        ranked_candidates.append({

            "result_id":
                str(
                    database_result.inserted_id
                ),

            "candidate_id":
                str(
                    candidate["_id"]
                ),

            "candidate_name":
                candidate.get(
                    "name",
                    "Unknown"
                ),

            "candidate_email":
                candidate.get(
                    "email",
                    ""
                ),

            "candidate_phone":
                candidate.get(
                    "phone",
                    ""
                ),

            "candidate_skills":
                candidate.get(
                    "skills",
                    []
                ),

            "candidate_education":
                candidate.get(
                    "education",
                    []
                ),

            "candidate_experience":
                candidate.get(
                    "experience",
                    []
                ),

            "match_score":
                score,

            "recommendation":
                recommendation,

            "matched_skills":
                result.get(
                    "matched_skills",
                    []
                ),

            "missing_skills":
                result.get(
                    "missing_skills",
                    []
                ),

            "strengths":
                result.get(
                    "strengths",
                    []
                ),

            "justification":
                result.get(
                    "justification",
                    ""
                )
        })


    ranked_candidates.sort(

        key=lambda candidate:
            candidate[
                "match_score"
            ],

        reverse=True
    )


    for index, candidate in enumerate(
        ranked_candidates,
        start=1
    ):

        candidate["rank"] = index


    shortlisted_count = sum(

        1

        for candidate
        in ranked_candidates

        if candidate[
            "recommendation"
        ] == "SHORTLIST"
    )


    return {

        "message":
            "Batch screening completed",

        "job_id":
            request.job_id,

        "job_title":
            job.get(
                "title",
                ""
            ),

        "total_candidates":
            len(
                ranked_candidates
            ),

        "shortlisted":
            shortlisted_count,

        "candidates":
            ranked_candidates
    }


@router.post("/calculate/{job_id}")
def calculate_screening_results(
    job_id: str,
    current_user=Depends(
        require_roles(
            "ADMIN"
        )
    )
):

    try:

        job_object_id = ObjectId(
            job_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )


    job = (
        jobs_collection
        .find_one(
            {
                "_id":
                    job_object_id
            }
        )
    )


    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job description not found"
        )


    candidates = list(
        candidates_collection.find({})
    )


    if not candidates:

        raise HTTPException(
            status_code=404,
            detail="No candidates found in the database"
        )


    screening_results_collection.delete_many(
        {
            "job_id":
                job_object_id
        }
    )


    ranked_candidates = []


    for candidate in candidates:

        result = (
            match_resume_with_job(
                candidate,
                job
            )
        )


        score = float(
            result["match_score"]
        )


        recommendation = (
            get_recommendation(
                score
            )
        )


        screening_document = {

            "candidate_id":
                candidate["_id"],

            "job_id":
                job_object_id,

            "match_score":
                score,

            "matched_skills":
                result.get(
                    "matched_skills",
                    []
                ),

            "missing_skills":
                result.get(
                    "missing_skills",
                    []
                ),

            "strengths":
                result.get(
                    "strengths",
                    []
                ),

            "recommendation":
                recommendation,

            "justification":
                result.get(
                    "justification",
                    ""
                ),

            "screened_by":
                str(
                    current_user["_id"]
                ),

            "screened_by_username":
                current_user.get(
                    "username",
                    ""
                ),

            "created_at":
                datetime.now(
                    timezone.utc
                )
        }


        database_result = (
            screening_results_collection
            .insert_one(
                screening_document
            )
        )


        ranked_candidates.append({

            "result_id":
                str(
                    database_result.inserted_id
                ),

            "candidate_id":
                str(
                    candidate["_id"]
                ),

            "candidate_name":
                candidate.get(
                    "name",
                    "Unknown"
                ),

            "candidate_email":
                candidate.get(
                    "email",
                    ""
                ),

            "candidate_phone":
                candidate.get(
                    "phone",
                    ""
                ),

            "candidate_skills":
                candidate.get(
                    "skills",
                    []
                ),

            "candidate_education":
                candidate.get(
                    "education",
                    []
                ),

            "candidate_experience":
                candidate.get(
                    "experience",
                    []
                ),

            "match_score":
                score,

            "recommendation":
                recommendation,

            "matched_skills":
                result.get(
                    "matched_skills",
                    []
                ),

            "missing_skills":
                result.get(
                    "missing_skills",
                    []
                ),

            "strengths":
                result.get(
                    "strengths",
                    []
                ),

            "justification":
                result.get(
                    "justification",
                    ""
                )
        })


    ranked_candidates.sort(

        key=lambda candidate:
            candidate[
                "match_score"
            ],

        reverse=True
    )


    for index, candidate in enumerate(
        ranked_candidates,
        start=1
    ):

        candidate["rank"] = index


    shortlisted_count = sum(

        1

        for candidate
        in ranked_candidates

        if candidate[
            "recommendation"
        ] == "SHORTLIST"
    )


    return {

        "message":
            "Screening calculated successfully",

        "job_id":
            job_id,

        "job_title":
            job.get(
                "title",
                ""
            ),

        "total_candidates":
            len(
                ranked_candidates
            ),

        "shortlisted":
            shortlisted_count,

        "candidates":
            ranked_candidates
    }


@router.get("/results")
def get_screening_results(
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    results = list(

        screening_results_collection
        .find({})
        .sort(
            "match_score",
            -1
        )
    )


    formatted_results = []


    for result in results:

        candidate = (
            candidates_collection
            .find_one(
                {
                    "_id":
                        result[
                            "candidate_id"
                        ]
                }
            )
        )


        job = (
            jobs_collection
            .find_one(
                {
                    "_id":
                        result[
                            "job_id"
                        ]
                }
            )
        )


        formatted_result = {

            "result_id":
                str(
                    result["_id"]
                ),

            "candidate_id":
                str(
                    result["candidate_id"]
                ),

            "candidate_name":
                candidate.get(
                    "name",
                    "Unknown Candidate"
                )
                if candidate
                else "Unknown Candidate",

            "candidate_email":
                candidate.get(
                    "email",
                    ""
                )
                if candidate
                else "",

            "candidate_phone":
                candidate.get(
                    "phone",
                    ""
                )
                if candidate
                else "",

            "job_id":
                str(
                    result["job_id"]
                ),

            "job_title":
                job.get(
                    "title",
                    ""
                )
                if job
                else "",

            "match_score":
                result.get(
                    "match_score",
                    0
                ),

            "recommendation":
                result.get(
                    "recommendation",
                    "REVIEW"
                ),

            "matched_skills":
                result.get(
                    "matched_skills",
                    []
                ),

            "missing_skills":
                result.get(
                    "missing_skills",
                    []
                ),

            "strengths":
                result.get(
                    "strengths",
                    []
                ),

            "justification":
                result.get(
                    "justification",
                    ""
                ),

            "created_at":
                result.get(
                    "created_at"
                )
        }


        formatted_results.append(
            formatted_result
        )


    return {

        "total":
            len(
                formatted_results
            ),

        "results":
            formatted_results
    }


@router.get("/results/{result_id}")
def get_screening_result(
    result_id: str,
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    try:

        result = (
            screening_results_collection
            .find_one(
                {
                    "_id":
                        ObjectId(
                            result_id
                        )
                }
            )
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid screening result ID"
        )


    if not result:

        raise HTTPException(
            status_code=404,
            detail="Screening result not found"
        )


    candidate = (
        candidates_collection
        .find_one(
            {
                "_id":
                    result[
                        "candidate_id"
                    ]
            }
        )
    )


    job = (
        jobs_collection
        .find_one(
            {
                "_id":
                    result[
                        "job_id"
                    ]
            }
        )
    )


    return {

        "result_id":
            str(
                result["_id"]
            ),

        "candidate_id":
            str(
                result["candidate_id"]
            ),

        "candidate_name":
            candidate.get(
                "name",
                "Unknown Candidate"
            )
            if candidate
            else "Unknown Candidate",

        "candidate_email":
            candidate.get(
                "email",
                ""
            )
            if candidate
            else "",

        "candidate_phone":
            candidate.get(
                "phone",
                ""
            )
            if candidate
            else "",

        "candidate_skills":
            candidate.get(
                "skills",
                []
            )
            if candidate
            else [],

        "candidate_education":
            candidate.get(
                "education",
                []
            )
            if candidate
            else [],

        "candidate_experience":
            candidate.get(
                "experience",
                []
            )
            if candidate
            else [],

        "job_id":
            str(
                result["job_id"]
            ),

        "job_title":
            job.get(
                "title",
                ""
            )
            if job
            else "",

        "match_score":
            result.get(
                "match_score",
                0
            ),

        "recommendation":
            result.get(
                "recommendation",
                "REVIEW"
            ),

        "matched_skills":
            result.get(
                "matched_skills",
                []
            ),

        "missing_skills":
            result.get(
                "missing_skills",
                []
            ),

        "strengths":
            result.get(
                "strengths",
                []
            ),

        "justification":
            result.get(
                "justification",
                ""
            ),

        "created_at":
            result.get(
                "created_at"
            )
    }


@router.get("/job/{job_id}")
def get_job_screening_results(
    job_id: str,
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    try:

        job_object_id = ObjectId(
            job_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )


    job = (
        jobs_collection
        .find_one(
            {
                "_id":
                    job_object_id
            }
        )
    )


    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job description not found"
        )


    results = list(

        screening_results_collection
        .find(
            {
                "job_id":
                    job_object_id
            }
        )
        .sort(
            "match_score",
            -1
        )
    )


    formatted_results = []


    for index, result in enumerate(
        results,
        start=1
    ):

        candidate = (
            candidates_collection
            .find_one(
                {
                    "_id":
                        result[
                            "candidate_id"
                        ]
                }
            )
        )


        if not candidate:

            continue


        formatted_results.append({

            "result_id":
                str(
                    result["_id"]
                ),

            "rank":
                index,

            "candidate_id":
                str(
                    result[
                        "candidate_id"
                    ]
                ),

            "candidate_name":
                candidate.get(
                    "name",
                    "Unknown Candidate"
                ),

            "candidate_email":
                candidate.get(
                    "email",
                    ""
                ),

            "candidate_phone":
                candidate.get(
                    "phone",
                    ""
                ),

            "candidate_skills":
                candidate.get(
                    "skills",
                    []
                ),

            "candidate_education":
                candidate.get(
                    "education",
                    []
                ),

            "candidate_experience":
                candidate.get(
                    "experience",
                    []
                ),

            "match_score":
                result.get(
                    "match_score",
                    0
                ),

            "recommendation":
                result.get(
                    "recommendation",
                    "REVIEW"
                ),

            "matched_skills":
                result.get(
                    "matched_skills",
                    []
                ),

            "missing_skills":
                result.get(
                    "missing_skills",
                    []
                ),

            "strengths":
                result.get(
                    "strengths",
                    []
                ),

            "justification":
                result.get(
                    "justification",
                    ""
                ),

            "created_at":
                result.get(
                    "created_at"
                )
        })


    for index, candidate in enumerate(
        formatted_results,
        start=1
    ):

        candidate["rank"] = index


    return {

        "job_id":
            job_id,

        "job_title":
            job.get(
                "title",
                ""
            ),

        "total":
            len(
                formatted_results
            ),

        "results":
            formatted_results
    }


@router.get("/job/{job_id}/export")
def export_final_shortlist(
    job_id: str,
    current_user=Depends(
        require_roles(
            "ADMIN"
        )
    )
):

    try:

        job_object_id = ObjectId(
            job_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )


    job = (
        jobs_collection
        .find_one(
            {
                "_id":
                    job_object_id
            }
        )
    )


    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job description not found"
        )


    results = list(

        screening_results_collection
        .find(
            {
                "job_id":
                    job_object_id
            }
        )
        .sort(
            "match_score",
            -1
        )
    )


    if not results:

        raise HTTPException(
            status_code=404,
            detail=
                "No screening results found for this job"
        )


    shortlisted_results = [

        result

        for result in results

        if result.get(
            "recommendation",
            ""
        ).upper() == "SHORTLIST"

    ]


    if not shortlisted_results:

        raise HTTPException(
            status_code=404,
            detail=
                "No shortlisted candidates found"
        )


    workbook = Workbook()

    worksheet = workbook.active

    worksheet.title = "Final Shortlist"


    worksheet.append([
        "Rank",
        "Candidate",
        "Email",
        "Phone",
        "Match Score",
        "Matched Skills",
        "Missing Skills",
        "Strengths",
        "Justification",
        "Recommendation"
    ])


    header_fill = PatternFill(
        fill_type="solid",
        fgColor="1E3A8A"
    )


    header_font = Font(
        bold=True,
        color="FFFFFF"
    )


    thin_side = Side(
        style="thin",
        color="D1D5DB"
    )


    border = Border(
        bottom=thin_side
    )


    for cell in worksheet[1]:

        cell.fill = header_fill

        cell.font = header_font

        cell.alignment = Alignment(
            horizontal="center",
            vertical="center"
        )

        cell.border = border


    for index, result in enumerate(
        shortlisted_results,
        start=1
    ):

        candidate = (
            candidates_collection
            .find_one(
                {
                    "_id":
                        result[
                            "candidate_id"
                        ]
                }
            )
        )


        if not candidate:

            continue


        matched_skills = result.get(
            "matched_skills",
            []
        )


        missing_skills = result.get(
            "missing_skills",
            []
        )


        strengths = result.get(
            "strengths",
            []
        )


        worksheet.append([

            index,

            candidate.get(
                "name",
                "Unknown Candidate"
            ),

            candidate.get(
                "email",
                ""
            ),

            candidate.get(
                "phone",
                ""
            ),

            result.get(
                "match_score",
                0
            ),

            ", ".join(
                matched_skills
            )
            if isinstance(
                matched_skills,
                list
            )
            else str(
                matched_skills
            ),

            ", ".join(
                missing_skills
            )
            if isinstance(
                missing_skills,
                list
            )
            else str(
                missing_skills
            ),

            "\n".join(
                strengths
            )
            if isinstance(
                strengths,
                list
            )
            else str(
                strengths
            ),

            result.get(
                "justification",
                ""
            ),

            result.get(
                "recommendation",
                "SHORTLIST"
            )

        ])


    for row in worksheet.iter_rows():

        for cell in row:

            cell.alignment = Alignment(
                vertical="top",
                wrap_text=True
            )


    column_widths = {

        "A": 10,
        "B": 30,
        "C": 35,
        "D": 20,
        "E": 15,
        "F": 40,
        "G": 40,
        "H": 45,
        "I": 65,
        "J": 20

    }


    for column, width in column_widths.items():

        worksheet.column_dimensions[
            column
        ].width = width


    worksheet.freeze_panes = "A2"


    worksheet.auto_filter.ref = (
        worksheet.dimensions
    )


    worksheet.row_dimensions[
        1
    ].height = 30


    output = BytesIO()

    workbook.save(
        output
    )

    output.seek(0)


    safe_job_title = (
        job.get(
            "title",
            "job"
        )
        .replace(
            " ",
            "_"
        )
        .replace(
            "/",
            "_"
        )
        .replace(
            "\\",
            "_"
        )
    )


    filename = (
        f"{safe_job_title}_"
        f"final_shortlist.xlsx"
    )


    return StreamingResponse(

        output,

        media_type=
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        }
    )