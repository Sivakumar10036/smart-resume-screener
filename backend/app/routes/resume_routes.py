from datetime import datetime, timezone

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile
)

from app.database import candidates_collection

from app.services.file_extractor import extract_resume_text

from app.services.llm_service import extract_resume_information

from app.services.job_parser import normalize_skills

from app.utils.security import (
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/api/resumes",
    tags=["Resumes"]
)


def candidate_belongs_to_user(
    candidate,
    current_user
):

    current_user_id = str(
        current_user["_id"]
    )

    owner_id = candidate.get(
        "owner_id"
    )

    uploaded_by = candidate.get(
        "uploaded_by"
    )

    if owner_id is not None:

        if str(owner_id) == current_user_id:

            return True

    if uploaded_by is not None:

        if str(uploaded_by) == current_user_id:

            return True

    return False


def convert_candidate_ids(
    candidate
):

    candidate["_id"] = str(
        candidate["_id"]
    )

    if "owner_id" in candidate:

        candidate["owner_id"] = str(
            candidate["owner_id"]
        )

    return candidate


@router.post("/upload")
async def upload_resume(

    file: UploadFile = File(...),

    current_user=Depends(
        get_current_user
    )

):

    user_role = str(
        current_user.get(
            "role",
            "VIEWER"
        )
    ).upper()

    if user_role not in [
        "VIEWER",
        "RECRUITER",
        "ADMIN"
    ]:

        raise HTTPException(
            status_code=403,
            detail="You do not have permission to upload resumes"
        )

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

    current_user_id = (
        current_user["_id"]
    )

    current_user_id_string = str(
        current_user_id
    )

    candidate = {

        "owner_id":
            current_user_id,

        "owner_username":
            current_user.get(
                "username",
                ""
            ),

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
            current_user_id_string,

        "uploaded_by_username":
            current_user.get(
                "username",
                ""
            ),

        "uploaded_by_role":
            user_role,

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
            user_role,

        "owner_id":
            current_user_id_string

    }


@router.get("/my-resume")
def get_my_resume(

    current_user=Depends(
        get_current_user
    )

):

    current_user_id = str(
        current_user["_id"]
    )

    candidates = list(

        candidates_collection.find(

            {
                "$or": [

                    {
                        "owner_id":
                            current_user["_id"]
                    },

                    {
                        "owner_id":
                            current_user_id
                    },

                    {
                        "uploaded_by":
                            current_user_id
                    }

                ]
            },

            {
                "raw_text": 0
            }

        ).sort(

            "created_at",
            -1

        )

    )

    if not candidates:

        return {

            "has_resume":
                False,

            "total":
                0,

            "candidates":
                []

        }

    converted_candidates = []

    for candidate in candidates:

        converted_candidates.append(
            convert_candidate_ids(
                candidate
            )
        )

    return {

        "has_resume":
            True,

        "total":
            len(
                converted_candidates
            ),

        "candidates":
            converted_candidates

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

        candidates_collection.find(

            {},

            {
                "raw_text": 0
            }

        ).sort(

            "created_at",
            -1

        )

    )

    converted_candidates = []

    for candidate in candidates:

        converted_candidates.append(
            convert_candidate_ids(
                candidate
            )
        )

    return {

        "total":
            len(
                converted_candidates
            ),

        "candidates":
            converted_candidates

    }


@router.get("/my/{candidate_id}")
def get_my_candidate(

    candidate_id: str,

    current_user=Depends(
        get_current_user
    )

):

    try:

        object_id = ObjectId(
            candidate_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid candidate ID"
        )

    candidate = (

        candidates_collection
        .find_one(

            {
                "_id":
                    object_id
            },

            {
                "raw_text": 0
            }

        )

    )

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    if not candidate_belongs_to_user(
        candidate,
        current_user
    ):

        raise HTTPException(
            status_code=403,
            detail="You can only view your own resume"
        )

    return convert_candidate_ids(
        candidate
    )


@router.get("/{candidate_id}")
def get_candidate(

    candidate_id: str,

    current_user=Depends(
        get_current_user
    )

):

    user_role = str(
        current_user.get(
            "role",
            "VIEWER"
        )
    ).upper()

    try:

        object_id = ObjectId(
            candidate_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid candidate ID"
        )

    candidate = (

        candidates_collection
        .find_one(

            {
                "_id":
                    object_id
            },

            {
                "raw_text": 0
            }

        )

    )

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    if user_role == "VIEWER":

        if not candidate_belongs_to_user(
            candidate,
            current_user
        ):

            raise HTTPException(
                status_code=403,
                detail="You can only view your own resume"
            )

    elif user_role not in [
        "ADMIN",
        "RECRUITER"
    ]:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return convert_candidate_ids(
        candidate
    )