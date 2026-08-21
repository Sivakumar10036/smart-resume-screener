import os

from dotenv import load_dotenv


load_dotenv()


class Settings:

    mongodb_uri = os.getenv(
        "MONGODB_URI"
    )

    database_name = os.getenv(
        "DATABASE_NAME",
        "smart_resume_screener"
    )

    gemini_api_key = os.getenv(
        "GEMINI_API_KEY"
    )

    gemini_model = os.getenv(
        "GEMINI_MODEL",
        "gemini-2.5-flash-lite"
    )

    shortlist_threshold = float(
        os.getenv(
            "SHORTLIST_THRESHOLD",
            "75"
        )
    )

    review_threshold = float(
        os.getenv(
            "REVIEW_THRESHOLD",
            "55"
        )
    )

    jwt_secret_key = os.getenv(
        "JWT_SECRET_KEY"
    )

    jwt_algorithm = os.getenv(
        "JWT_ALGORITHM",
        "HS256"
    )

    jwt_access_token_expire_minutes = int(
        os.getenv(
            "JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
            "60"
        )
    )


settings = Settings()