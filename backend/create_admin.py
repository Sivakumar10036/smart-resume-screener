from datetime import datetime, timezone

from app.database import users_collection

from app.utils.security import hash_password


ADMIN_USERNAME = "admin"

ADMIN_EMAIL = "admin@smartresume.com"

ADMIN_PASSWORD = "Admin@12345"


existing_admin = users_collection.find_one(
    {
        "role": "ADMIN"
    }
)


if existing_admin:

    print(
        "An ADMIN account already exists."
    )

else:

    existing_user = users_collection.find_one(
        {
            "$or": [
                {
                    "username":
                        ADMIN_USERNAME
                },
                {
                    "email":
                        ADMIN_EMAIL
                }
            ]
        }
    )


    if existing_user:

        print(
            "Username or email already exists."
        )

    else:

        admin_document = {

            "username":
                ADMIN_USERNAME,

            "email":
                ADMIN_EMAIL,

            "hashed_password":
                hash_password(
                    ADMIN_PASSWORD
                ),

            "role":
                "ADMIN",

            "status":
                "ACTIVE",

            "is_active":
                True,

            "created_at":
                datetime.now(
                    timezone.utc
                )
        }


        result = (
            users_collection
            .insert_one(
                admin_document
            )
        )


        print(
            "ADMIN account created successfully."
        )

        print(
            "User ID:",
            result.inserted_id
        )

        print(
            "Username:",
            ADMIN_USERNAME
        )

        print(
            "Email:",
            ADMIN_EMAIL
        )

        print(
            "Role: ADMIN"
        )

        print(
            "Status: ACTIVE"
        )   