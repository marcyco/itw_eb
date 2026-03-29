"""
用户 Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """用户基础 Schema"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱地址")


class UserCreate(UserBase):
    """创建用户 Schema"""
    password: str = Field(..., min_length=6, max_length=128, description="密码")


class UserLogin(BaseModel):
    """用户登录 Schema"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class UserUpdate(BaseModel):
    """更新用户信息 Schema"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    """用户响应 Schema"""
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token Schema"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token 数据 Schema"""
    username: Optional[str] = None
    user_id: Optional[int] = None
