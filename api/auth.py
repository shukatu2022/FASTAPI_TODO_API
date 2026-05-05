import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession

from api.schemas.user import TokenData
from api.db import get_db


# JWT設定
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "your-secret-key-change-this-in-production",
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# HTTPBearer設定
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """平文パスワードとハッシュ化されたパスワードを比較"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """パスワードをハッシュ化"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def create_access_token(
        data: dict, expires_delta: Optional[timedelta] = None
        ) -> str:
    """アクセストークンを生成"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = (
            datetime.utcnow()
            + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> TokenData | None:
    """トークンをデコードして検証"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        token_data = TokenData(email=email)
        return token_data
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """現在のユーザーを取得（トークン検証）"""
    token = credentials.credentials
    token_data = decode_token(token)

    if token_data is None or token_data.email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ユーザーをDBから取得
    from api.cruds.user import get_user_by_email
    user = await get_user_by_email(db, email=token_data.email)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
