from datetime import datetime, timezone

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordRequestForm
)

from app.database import users_collection

from app.schemas.auth_schema import (
    RegisterRequest,
    LoginResponse
)

from app.utils.security import (
    create_access_token,
    get_current_user,
    hash_password,
    require_roles,
    verify_password
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/register"
)
def register_user(
    user_data: RegisterRequest
):

    username = user_data.username.strip()

    email = user_data.email.strip().lower()

    password = user_data.password


    if not username:

        raise HTTPException(
            status_code=400,
            detail="Username is required"
        )


    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )


    if not password:

        raise HTTPException(
            status_code=400,
            detail="Password is required"
        )


    if len(password) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters"
        )


    existing_user = users_collection.find_one(

        {
            "$or": [

                {
                    "username":
                        username
                },

                {
                    "email":
                        email
                }

            ]
        }

    )


    if existing_user:

        raise HTTPException(

            status_code=400,

            detail=
                "Username or email already exists"

        )


    hashed_password = hash_password(
        password
    )


    user = {

        "username":
            username,

        "email":
            email,

        "hashed_password":
            hashed_password,

        "role":
            "VIEWER",

        "status":
            "ACTIVE",

        "is_active":
            True,

        "created_at":
            datetime.now(
                timezone.utc
            )

    }


    result = users_collection.insert_one(
        user
    )


    return {

        "message":
            "Account created successfully",

        "user_id":
            str(
                result.inserted_id
            ),

        "username":
            username,

        "email":
            email,

        "role":
            "VIEWER",

        "status":
            "ACTIVE",

        "is_active":
            True

    }


@router.post(
    "/login",
    response_model=LoginResponse
)
def login_user(

    form_data:
        OAuth2PasswordRequestForm =
            Depends()

):

    username = form_data.username.strip()


    user = users_collection.find_one(

        {
            "username":
                username
        }

    )


    if not user:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid username or password",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


    stored_password = user.get(

        "hashed_password",

        user.get(
            "password",
            ""
        )

    )


    if not stored_password:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid username or password",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


    if not verify_password(

        form_data.password,

        stored_password

    ):

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid username or password",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


    is_active = user.get(
        "is_active",
        True
    )


    if is_active is False:

        raise HTTPException(

            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "Your account is disabled"

        )


    role = str(

        user.get(
            "role",
            "VIEWER"
        )

    ).upper()


    if role not in [
        "VIEWER",
        "RECRUITER",
        "ADMIN"
    ]:

        role = "VIEWER"


    access_token = create_access_token(

        user_id=
            str(
                user["_id"]
            ),

        username=
            user["username"],

        role=
            role

    )


    return {

        "access_token":
            access_token,

        "token_type":
            "bearer",

        "user": {

            "id":
                str(
                    user["_id"]
                ),

            "username":
                user.get(
                    "username",
                    ""
                ),

            "email":
                user.get(
                    "email",
                    ""
                ),

            "role":
                role,

            "status":
                user.get(
                    "status",
                    "ACTIVE"
                ),

            "is_active":
                True

        }

    }


@router.get(
    "/me"
)
def get_me(

    current_user=Depends(
        get_current_user
    )

):

    role = str(

        current_user.get(
            "role",
            "VIEWER"
        )

    ).upper()


    return {

        "id":
            str(
                current_user["_id"]
            ),

        "username":
            current_user.get(
                "username",
                ""
            ),

        "email":
            current_user.get(
                "email",
                ""
            ),

        "role":
            role,

        "status":
            current_user.get(
                "status",
                "ACTIVE"
            ),

        "is_active":
            current_user.get(
                "is_active",
                True
            )

    }


@router.get(
    "/users"
)
def get_users(

    current_user=Depends(
        require_roles(
            "ADMIN"
        )
    )

):

    users = list(

        users_collection.find(

            {},

            {
                "hashed_password": 0,
                "password": 0
            }

        ).sort(

            "created_at",
            -1

        )

    )


    result = []


    for user in users:

        role = str(

            user.get(
                "role",
                "VIEWER"
            )

        ).upper()


        result.append({

            "id":
                str(
                    user["_id"]
                ),

            "username":
                user.get(
                    "username",
                    ""
                ),

            "email":
                user.get(
                    "email",
                    ""
                ),

            "role":
                role,

            "status":
                user.get(
                    "status",
                    "ACTIVE"
                ),

            "is_active":
                user.get(
                    "is_active",
                    True
                )

        })


    return {

        "users":
            result

    }


@router.put(
    "/users/{user_id}/role"
)
def change_user_role(

    user_id: str,

    role: str,

    current_user=Depends(
        require_roles(
            "ADMIN"
        )
    )

):

    role = role.strip().upper()


    if role not in [

        "VIEWER",

        "RECRUITER",

        "ADMIN"

    ]:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Invalid role. Use VIEWER, RECRUITER or ADMIN"

        )


    try:

        object_id = ObjectId(
            user_id
        )

    except Exception:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Invalid user ID"

        )


    result = users_collection.update_one(

        {
            "_id":
                object_id
        },

        {
            "$set": {

                "role":
                    role

            }
        }

    )


    if result.matched_count == 0:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "User not found"

        )


    return {

        "message":
            "User role updated successfully",

        "role":
            role

    }


@router.put(
    "/users/{user_id}/activate"
)
def activate_user(

    user_id: str,

    current_user=Depends(
        require_roles(
            "ADMIN"
        )
    )

):

    try:

        object_id = ObjectId(
            user_id
        )

    except Exception:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Invalid user ID"

        )


    result = users_collection.update_one(

        {
            "_id":
                object_id
        },

        {
            "$set": {

                "is_active":
                    True,

                "status":
                    "ACTIVE"

            }
        }

    )


    if result.matched_count == 0:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "User not found"

        )


    return {

        "message":
            "User activated successfully"

    }


@router.put(
    "/users/{user_id}/deactivate"
)
def deactivate_user(

    user_id: str,

    current_user=Depends(
        require_roles(
            "ADMIN"
        )
    )

):

    try:

        object_id = ObjectId(
            user_id
        )

    except Exception:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Invalid user ID"

        )


    result = users_collection.update_one(

        {
            "_id":
                object_id
        },

        {
            "$set": {

                "is_active":
                    False,

                "status":
                    "DISABLED"

            }
        }

    )


    if result.matched_count == 0:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "User not found"

        )


    return {

        "message":
            "User deactivated successfully"

    }