"""
实验日志模型
记录实验操作历史
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class ExperimentLog(Base):
    __tablename__ = "experiment_logs"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False)  # create, update, delete, run, stop, packet_send, etc.
    data = Column(JSON, nullable=True)  # 操作相关的数据
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    experiment = relationship("Experiment", back_populates="logs")
    user = relationship("User", back_populates="logs")

    @classmethod
    def create_log(cls, experiment_id: int, user_id: int, action: str, data: dict = None) -> "ExperimentLog":
        """创建实验日志"""
        return cls(
            experiment_id=experiment_id,
            user_id=user_id,
            action=action,
            data=data,
        )
