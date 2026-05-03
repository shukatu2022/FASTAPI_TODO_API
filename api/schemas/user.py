from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """ユーザー登録時のリクエストスキーマ"""
    email: EmailStr
    password: str

    def validate_password(self) -> bool:
        """bcryptの72バイト制限に対応"""
        if len(self.password.encode('utf-8')) > 72:
            raise ValueError(
                "Password must be 72 bytes or less. "
                "Please use a shorter password."
            )
        return True


class UserLogin(BaseModel):
    """ログイン時のリクエストスキーマ"""
    email: EmailStr
    password: str

    def validate_password(self) -> bool:
        """bcryptの72バイト制限に対応"""
        if len(self.password.encode('utf-8')) > 72:
            raise ValueError(
                "Password must be 72 bytes or less. "
                "Please use a shorter password."
            )
        return True


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
