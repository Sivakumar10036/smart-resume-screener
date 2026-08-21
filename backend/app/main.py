import os

from datetime import datetime, timezone

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.database import (
    candidates_collection,
    test_database_connection
)

from app.routes.resume_routes import (
    router as resume_router
)

from app.routes.auth_routes import (
    router as auth_router
)

from app.routes.job_routes import (
    router as job_router
)

from app.routes.screening_routes import (
    router as screening_router
)


app = FastAPI(

    title="Smart Resume Screener",

    description=
        "AI-powered resume screening system",

    version="1.0.0"

)


frontend_url = os.getenv(
    "FRONTEND_URL",
    ""
)


allowed_origins = [

    "http://localhost:5173",

    "http://127.0.0.1:5173"

]


if frontend_url:

    allowed_origins.append(
        frontend_url
    )


app.add_middleware(

    CORSMiddleware,

    allow_origins=
        allowed_origins,

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ]

)


app.include_router(
    resume_router
)


app.include_router(
    job_router
)


app.include_router(
    screening_router
)


app.include_router(
    auth_router
)


@app.get("/")
def home():

    return {

        "message":
            "Smart Resume Screener API is running"

    }


@app.get("/health")
def health():

    database_status = (
        test_database_connection()
    )

    return {

        "status":
            "healthy",

        "database":
            "connected"
            if database_status
            else "disconnected"

    }


@app.post("/test-database")
def test_database():

    document = {

        "test":
            True,

        "message":
            "MongoDB connection is working",

        "created_at":
            datetime.now(
                timezone.utc
            )

    }


    result = (

        candidates_collection

        .insert_one(
            document
        )

    )


    return {

        "message":
            "Document inserted successfully",

        "document_id":
            str(
                result.inserted_id
            )

    }