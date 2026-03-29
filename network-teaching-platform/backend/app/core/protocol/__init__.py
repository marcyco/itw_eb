"""
协议模拟引擎核心模块
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum
import uuid
import time


class ProtocolType(Enum):
    """协议类型"""
    TCP = "tcp"
    UDP = "udp"
    HTTP = "http"
    RIP = "rip"
    FTP = "ftp"


@dataclass
class Packet:
    """数据包"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    protocol: ProtocolType = ProtocolType.TCP
    data: Dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    source: str = ""
    destination: str = ""


class BaseProtocol(ABC):
    """协议基类"""
    
    def __init__(self):
        self.packets: List[Packet] = []
    
    @abstractmethod
    def create_packet(self, data: Dict[str, Any]) -> Packet:
        """创建数据包"""
        pass
    
    @abstractmethod
    def process_packet(self, packet: Packet) -> Dict[str, Any]:
        """处理数据包"""
        pass
    
    @abstractmethod
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据"""
        pass
