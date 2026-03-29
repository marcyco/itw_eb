"""
实验模型
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    protocol_type = Column(String(50), nullable=False)
    topology_data = Column(JSON, nullable=True)
    config = Column(JSON, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    owner = relationship("User", back_populates="experiments")
    logs = relationship("ExperimentLog", back_populates="experiment", cascade="all, delete-orphan")
    packets = relationship("Packet", back_populates="experiment", cascade="all, delete-orphan")
