from datetime import (
    datetime,
    timedelta,
    timezone
)

import jwt

from bson import ObjectId

from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordBearer
)

from jwt.exceptions import (
    InvalidTokenError
)

from pwdlib import PasswordHash

from app.config import settings

from app.database import users_collection


password_hash = PasswordHash.recommended()


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


def hash_password(
    password: str
):

    return password_hash.hash(
        password
    )


def verify_password(
    password: str,
    hashed_password: str
):

    return password_hash.verify(
        password,
        hashed_password
    )


def create_access_token(
    user_id: str,
    username: str,
    role: str
):

    expire = (
        datetime.now(
            timezone.utc
        )
        +
        timedelta(
            minutes=
                settings
                .jwt_access_token_expire_minutes
        )
    )

    payload = {

        "sub":
            str(
                user_id
            ),

        "username":
            username,

        "role":
            role,

        "exp":
            expire
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )


def get_current_user(
    token: str = Depends(
        oauth2_scheme
    )
):

    credentials_exception = HTTPException(

        status_code=
            status.HTTP_401_UNAUTHORIZED,

        detail=
            "Could not validate credentials",

        headers={
            "WWW-Authenticate":
                "Bearer"
        }
    )

    try:

        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[
                settings.jwt_algorithm
            ]
        )

        user_id = payload.get(
            "sub"
        )

        if not user_id:

            raise credentials_exception

        user_object_id = ObjectId(
            user_id
        )

    except (
        InvalidTokenError,
        ValueError
    ):

        raise credentials_exception

    user = (
        users_collection
        .find_one(
            {
                "_id":
                    user_object_id
            }
        )
    )

    if not user:

        raise credentials_exception

    if not user.get(
        "is_active",
        True
    ):

        raise HTTPException(

            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "User account is disabled"
        )

    return user


def require_roles(
    *allowed_roles
):

    def role_checker(
        current_user=Depends(
            get_current_user
        )
    ):

        user_role = (
            current_user.get(
                "role"
            )
        )

        if user_role not in allowed_roles:

            raise HTTPException(

                status_code=
                    status.HTTP_403_FORBIDDEN,

                detail=
                    "You do not have permission to perform this action"
            )

        return current_user

    return role_checker