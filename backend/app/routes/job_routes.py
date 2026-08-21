from datetime import datetime, timezone

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from app.database import (
    jobs_collection
)

from app.schemas.job_schema import (
    JobDescriptionCreate
)

from app.services.job_parser import (
    extract_job_skills
)

from app.utils.security import (
    require_roles
)


router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs"]
)


@router.post("/")
def create_job(
    job: JobDescriptionCreate,
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    required_skills = (
        extract_job_skills(
            job.description
        )
    )

    job_document = {

        "title":
            job.title,

        "description":
            job.description,

        "required_skills":
            required_skills,

        "created_by":
            str(
                current_user["_id"]
            ),

        "created_by_username":
            current_user.get(
                "username",
                ""
            ),

        "created_by_role":
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
        jobs_collection
        .insert_one(
            job_document
        )
    )

    return {

        "message":
            "Job description created successfully",

        "job_id":
            str(
                result.inserted_id
            ),

        "title":
            job.title,

        "required_skills":
            required_skills
    }


@router.get("/")
def get_jobs(
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    jobs = list(

        jobs_collection
        .find(
            {},
            {
                "description": 1,
                "title": 1,
                "required_skills": 1,
                "created_at": 1,
                "created_by": 1,
                "created_by_username": 1,
                "created_by_role": 1
            }
        )
        .sort(
            "created_at",
            -1
        )
    )

    for job in jobs:

        job["_id"] = str(
            job["_id"]
        )

    return {

        "total":
            len(jobs),

        "jobs":
            jobs
    }


@router.get("/{job_id}")
def get_job(
    job_id: str,
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
                            job_id
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

    job["_id"] = str(
        job["_id"]
    )

    return job


@router.put("/{job_id}")
def update_job(
    job_id: str,
    job: JobDescriptionCreate,
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    try:

        object_id = ObjectId(
            job_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    existing_job = (
        jobs_collection
        .find_one(
            {
                "_id":
                    object_id
            }
        )
    )

    if not existing_job:

        raise HTTPException(
            status_code=404,
            detail="Job description not found"
        )

    required_skills = (
        extract_job_skills(
            job.description
        )
    )

    updated_job = {

        "title":
            job.title,

        "description":
            job.description,

        "required_skills":
            required_skills,

        "updated_at":
            datetime.now(
                timezone.utc
            ),

        "updated_by":
            str(
                current_user["_id"]
            ),

        "updated_by_username":
            current_user.get(
                "username",
                ""
            )
    }

    jobs_collection.update_one(

        {
            "_id":
                object_id
        },

        {
            "$set":
                updated_job
        }

    )

    return {

        "message":
            "Job description updated successfully",

        "job_id":
            job_id,

        "title":
            job.title,

        "required_skills":
            required_skills
    }


@router.delete("/{job_id}")
def delete_job(
    job_id: str,
    current_user=Depends(
        require_roles(
            "ADMIN",
            "RECRUITER"
        )
    )
):

    try:

        object_id = ObjectId(
            job_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    result = (
        jobs_collection
        .delete_one(
            {
                "_id":
                    object_id
            }
        )
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Job description not found"
        )

    return {

        "message":
            "Job description deleted successfully",

        "job_id":
            job_id
    }