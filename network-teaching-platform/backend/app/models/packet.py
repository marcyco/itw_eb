"""
数据包记录模型
记录实验中的数据包（用于回放和分析）
"""
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Packet(Base):
    __tablename__ = "packets"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    packet_id = Column(String(100), nullable=False, index=True)
    protocol = Column(String(20), nullable=False)  # tcp, udp, http, rip, ftp
    source = Column(String(50), nullable=False)
    destination = Column(String(50), nullable=False)
    data = Column(JSON, nullable=False)  # 数据包内容
    timestamp = Column(BigInteger, nullable=False)  # Unix 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    experiment = relationship("Experiment", back_populates="packets")

    @classmethod
    def create_packet(
        cls,
        experiment_id: int,
        packet_id: str,
        protocol: str,
        source: str,
        destination: str,
        data: dict,
        timestamp: int = None,
    ) -> "Packet":
        """创建数据包记录"""
        return cls(
            experiment_id=experiment_id,
            packet_id=packet_id,
            protocol=protocol,
            source=source,
            destination=destination,
            data=data,
            timestamp=timestamp or int(datetime.utcnow().timestamp()),
        )
