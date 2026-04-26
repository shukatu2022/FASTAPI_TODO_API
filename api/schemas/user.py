from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """ユーザー登録時のリクエストスキーマ"""
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """ログイン時のリクエストスキーマ"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """ユーザー情報のレスポンススキーマ"""
    id: int
    email: str
    is_active: int

    class Config:
        from_attributes = True


class Token(BaseModel):
    """トークンレスポンススキーマ"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """トークンペイロードのスキーマ"""
    email: str | None = None
