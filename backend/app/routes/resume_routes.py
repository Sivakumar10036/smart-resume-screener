from datetime import datetime, timezone

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile
)

from app.database import (
    candidates_collection
)

from app.services.file_extractor import (
    extract_resume_text
)

from app.services.llm_service import (
    extract_resume_information
)

from app.services.job_parser import (
    normalize_skills
)

from app.utils.security import (
    require_roles
)


router = APIRouter(
    prefix="/api/resumes",
    tags=["Resumes"]
)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )

    filename = file.filename.lower()

    if not (
        filename.endswith(".pdf")
        or
        filename.endswith(".txt")
    ):

        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported"
        )

    file_bytes = await file.read()

    if not file_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    resume_text = extract_resume_text(
        file.filename,
        file_bytes
    )

    if not resume_text.strip():

        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the resume"
        )

    candidate_profile = (
        extract_resume_information(
            resume_text
        )
    )

    candidate_profile["skills"] = (
        normalize_skills(
            candidate_profile.get(
                "skills",
                []
            )
        )
    )

    candidate = {

        "name":
            candidate_profile.get(
                "name",
                ""
            ),

        "email":
            candidate_profile.get(
                "email",
                ""
            ),

        "phone":
            candidate_profile.get(
                "phone",
                ""
            ),

        "skills":
            candidate_profile.get(
                "skills",
                []
            ),

        "education":
            candidate_profile.get(
                "education",
                []
            ),

        "experience":
            candidate_profile.get(
                "experience",
                []
            ),

        "resume_filename":
            file.filename,

        "resume_type":
            file.content_type,

        "raw_text":
            resume_text,

        "uploaded_by":
            str(
                current_user["_id"]
            ),

        "uploaded_by_username":
            current_user.get(
                "username",
                ""
            ),

        "uploaded_by_role":
            current_user.get(
                "role",
                ""
            ),

        "created_at":
            datetime.now(
                timezone.utc
            )
    }

    result = (
        candidates_collection
        .insert_one(
            candidate
        )
    )

    return {

        "message":
            "Resume processed successfully",

        "candidate_id":
            str(
                result.inserted_id
            ),

        "filename":
            file.filename,

        "candidate":
            candidate_profile,

        "uploaded_by":
            current_user.get(
                "username",
                ""
            ),

        "uploaded_by_role":
            current_user.get(
                "role",
                ""
            )
    }


@router.get("/")
def get_candidates(
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    candidates = list(

        candidates_collection
        .find(
            {},
            {
                "raw_text": 0
            }
        )
        .sort(
            "created_at",
            -1
        )
    )

    for candidate in candidates:

        candidate["_id"] = str(
            candidate["_id"]
        )

    return {

        "total":
            len(candidates),

        "candidates":
            candidates
    }


@router.get("/{candidate_id}")
def get_candidate(
    candidate_id: str,
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
                },
                {
                    "raw_text": 0
                }
            )
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid candidate ID"
        )

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    candidate["_id"] = str(
        candidate["_id"]
    )

    return candidate