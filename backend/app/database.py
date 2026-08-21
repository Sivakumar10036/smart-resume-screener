from pymongo import MongoClient

from app.config import settings


client = MongoClient(
    settings.mongodb_uri,
    serverSelectionTimeoutMS=5000
)


database = client[
    settings.database_name
]

users_collection = database["users"]

candidates_collection = database[
    "candidates"
]

jobs_collection = database[
    "jobs"
]

screening_results_collection = database[
    "screening_results"
]


def test_database_connection():

    try:

        client.admin.command("ping")

        return True

    except Exception:

        return False