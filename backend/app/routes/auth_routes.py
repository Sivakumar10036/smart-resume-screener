from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordRequestForm
)

from bson import ObjectId

from app.database import users_collection

from app.schemas.auth_schema import (
    RegisterRequest
)

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    request: RegisterRequest
):

    username = request.username.strip()

    email = request.email.strip().lower()

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

    if len(request.password) < 6:

        raise HTTPException(
            status_code=400,
            detail=
                "Password must contain at least 6 characters"
        )

    existing_user = (
        users_collection
        .find_one(
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
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail=
                "Username or email already exists"
        )

    user_document = {

        "username":
            username,

        "email":
            email,

        "hashed_password":
            hash_password(
                request.password
            ),

        "role":
            "VIEWER",

        "status":
            "PENDING",

        "is_active":
            False,

        "created_at":
            datetime.now(
                timezone.utc
            )
    }

    result = (
        users_collection
        .insert_one(
            user_document
        )
    )

    return {

        "message":
            "Registration successful. Your account is waiting for administrator approval.",

        "user_id":
            str(
                result.inserted_id
            ),

        "username":
            username,

        "role":
            "VIEWER",

        "status":
            "PENDING"
    }


@router.post("/login")
def login(
    form_data:
        OAuth2PasswordRequestForm =
            Depends()
):

    user = (
        users_collection
        .find_one(
            {
                "username":
                    form_data.username
            }
        )
    )

    if not user:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Incorrect username or password",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }
        )

    password_valid = verify_password(

        form_data.password,

        user.get(
            "hashed_password",
            ""
        )
    )

    if not password_valid:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Incorrect username or password",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }
        )

    user_status = user.get(
        "status",
        "ACTIVE"
    )

    if user_status == "PENDING":

        raise HTTPException(

            status_code=403,

            detail=
                "Your account is waiting for administrator approval"
        )

    if user_status == "REJECTED":

        raise HTTPException(

            status_code=403,

            detail=
                "Your account registration was rejected"
        )

    if not user.get(
        "is_active",
        False
    ):

        raise HTTPException(

            status_code=403,

            detail=
                "User account is disabled"
        )

    access_token = create_access_token(

        str(
            user["_id"]
        ),

        user["username"],

        user["role"]
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
                user["username"],

            "email":
                user["email"],

            "role":
                user["role"],

            "status":
                user.get(
                    "status",
                    "ACTIVE"
                ),

            "is_active":
                user.get(
                    "is_active",
                    False
                )
        }
    }


@router.get("/me")
def get_me(
    current_user=Depends(
        get_current_user
    )
):

    return {

        "id":
            str(
                current_user["_id"]
            ),

        "username":
            current_user["username"],

        "email":
            current_user["email"],

        "role":
            current_user["role"],

        "status":
            current_user.get(
                "status",
                "ACTIVE"
            ),

        "is_active":
            current_user.get(
                "is_active",
                False
            )
    }


@router.get("/users")
def get_users(
    current_user=Depends(
        require_roles(
            "ADMIN"
        )
    )
):

    users = list(

        users_collection
        .find(
            {},
            {
                "hashed_password": 0
            }
        )
        .sort(
            "created_at",
            -1
        )
    )

    for user in users:

        user["_id"] = str(
            user["_id"]
        )

    return {

        "total":
            len(users),

        "users":
            users
    }


@router.put(
    "/users/{user_id}/approve"
)
def approve_user(
    user_id: str,
    current_user=Depends(
        require_roles(
            "ADMIN"
        )
    )
):

    try:

        target_user_id = ObjectId(
            user_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    target_user = (
        users_collection
        .find_one(
            {
                "_id":
                    target_user_id
            }
        )
    )

    if not target_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if target_user.get(
        "role"
    ) == "ADMIN":

        raise HTTPException(
            status_code=400,
            detail=
                "Administrator account does not require approval"
        )

    users_collection.update_one(

        {
            "_id":
                target_user_id
        },

        {
            "$set": {

                "status":
                    "ACTIVE",

                "is_active":
                    True,

                "approved_at":
                    datetime.now(
                        timezone.utc
                    ),

                "approved_by":
                    str(
                        current_user["_id"]
                    )
            }
        }
    )

    return {

        "message":
            "User approved successfully",

        "user_id":
            user_id,

        "status":
            "ACTIVE"
    }


@router.put(
    "/users/{user_id}/reject"
)
def reject_user(
    user_id: str,
    current_user=Depends(
        require_roles(
            "ADMIN"
        )
    )
):

    try:

        target_user_id = ObjectId(
            user_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    target_user = (
        users_collection
        .find_one(
            {
                "_id":
                    target_user_id
            }
        )
    )

    if not target_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if target_user.get(
        "role"
    ) == "ADMIN":

        raise HTTPException(
            status_code=400,
            detail=
                "Administrator account cannot be rejected"
        )

    users_collection.update_one(

        {
            "_id":
                target_user_id
        },

        {
            "$set": {

                "status":
                    "REJECTED",

                "is_active":
                    False,

                "rejected_at":
                    datetime.now(
                        timezone.utc
                    ),

                "rejected_by":
                    str(
                        current_user["_id"]
                    )
            }
        }
    )

    return {

        "message":
            "User rejected successfully",

        "user_id":
            user_id,

        "status":
            "REJECTED"
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
        "RECRUITER"
    ]:

        raise HTTPException(
            status_code=400,
            detail=
                "Role must be VIEWER or RECRUITER"
        )

    try:

        target_user_id = ObjectId(
            user_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    target_user = (
        users_collection
        .find_one(
            {
                "_id":
                    target_user_id
            }
        )
    )

    if not target_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if target_user.get(
        "role"
    ) == "ADMIN":

        raise HTTPException(
            status_code=400,
            detail=
                "Administrator role cannot be changed"
        )

    users_collection.update_one(

        {
            "_id":
                target_user_id
        },

        {
            "$set": {

                "role":
                    role,

                "role_updated_at":
                    datetime.now(
                        timezone.utc
                    ),

                "role_updated_by":
                    str(
                        current_user["_id"]
                    )
            }
        }
    )

    return {

        "message":
            "User role updated successfully",

        "user_id":
            user_id,

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

        target_user_id = ObjectId(
            user_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    target_user = (
        users_collection
        .find_one(
            {
                "_id":
                    target_user_id
            }
        )
    )

    if not target_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    users_collection.update_one(

        {
            "_id":
                target_user_id
        },

        {
            "$set": {

                "is_active":
                    True,

                "status":
                    "ACTIVE",

                "activated_at":
                    datetime.now(
                        timezone.utc
                    ),

                "activated_by":
                    str(
                        current_user["_id"]
                    )
            }
        }
    )

    return {

        "message":
            "User activated successfully",

        "user_id":
            user_id,

        "status":
            "ACTIVE"
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

        target_user_id = ObjectId(
            user_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    target_user = (
        users_collection
        .find_one(
            {
                "_id":
                    target_user_id
            }
        )
    )

    if not target_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if target_user.get(
        "role"
    ) == "ADMIN":

        raise HTTPException(
            status_code=400,
            detail=
                "Administrator account cannot be deactivated"
        )

    users_collection.update_one(

        {
            "_id":
                target_user_id
        },

        {
            "$set": {

                "is_active":
                    False,

                "status":
                    "DISABLED",

                "deactivated_at":
                    datetime.now(
                        timezone.utc
                    ),

                "deactivated_by":
                    str(
                        current_user["_id"]
                    )
            }
        }
    )

    return {

        "message":
            "User deactivated successfully",

        "user_id":
            user_id,

        "status":
            "DISABLED"
    }