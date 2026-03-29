"""
会话模型
用于存储用户会话信息
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="sessions")

    @property
    def is_expired(self) -> bool:
        """检查会话是否已过期"""
        return datetime.utcnow() > self.expires_at

    @classmethod
    def create_token(cls, user_id: int, token: str, expire_minutes: int = 30) -> "Session":
        """创建新会话"""
        return cls(
            user_id=user_id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(minutes=expire_minutes),
        )
