# NetLab 后端开发任务清单

## 📋 任务概览

| 阶段 | 任务 | 优先级 | 预计工时 | 状态 |
|------|------|--------|----------|------|
| 1 | 项目初始化 | P0 | 1 天 | ⏳ |
| 1 | 数据库设计与实现 | P0 | 3 天 | ⏳ |
| 1 | 认证系统 | P0 | 2 天 | ⏳ |
| 2 | WebSocket 服务 | P0 | 3 天 | ⏳ |
| 2 | 协议模拟引擎基础 | P0 | 5 天 | ⏳ |
| 3 | TCP 协议模拟 | P0 | 4 天 | ⏳ |
| 3 | UDP 协议模拟 | P0 | 3 天 | ⏳ |
| 3 | HTTP 协议模拟 | P0 | 4 天 | ⏳ |
| 3 | RIP 协议模拟 | P1 | 4 天 | ⏳ |
| 3 | FTP 协议模拟 | P1 | 3 天 | ⏳ |
| 4 | 自由实验室支持 | P1 | 4 天 | ⏳ |
| 5 | 测试与优化 | P1 | 3 天 | ⏳ |

---

## 🚀 第一阶段：基础架构

### 1.1 项目初始化

**任务描述**: 创建 FastAPI 项目结构

**具体工作**:
- [ ] 创建 Python 虚拟环境
- [ ] 安装基础依赖
- [ ] 配置项目目录结构
- [ ] 配置环境变量管理

**依赖安装**:
```bash
# 创建虚拟环境
python -m venv venv
venv\Scripts\activate

# 安装基础依赖
pip install fastapi uvicorn[standard] sqlalchemy pydantic
pip install python-jose[cryptography] passlib[bcrypt]
pip install python-dotenv
pip install websockets
pip install pytest pytest-asyncio
```

**requirements.txt**:
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
websockets==12.0
pymysql==1.1.0
alembic==1.12.1
pytest==7.4.3
pytest-asyncio==0.21.1
```

**目录结构**:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   ├── schemas/
│   ├── api/
│   ├── core/
│   └── websocket/
├── venv/
├── requirements.txt
├── .env
├── .env.example
└── start.bat
```

**交付物**:
- [ ] 可运行的 FastAPI 应用
- [ ] 完整的项目结构
- [ ] 环境配置文档

---

### 1.2 数据库设计与实现

**任务描述**: 设计并实现数据库模型

**具体工作**:

#### 数据库配置
```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:password@localhost/network_teaching"
# 或 SQLite: "sqlite:///./network_teaching.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

#### 用户模型 (User)
```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    experiments = relationship("Experiment", back_populates="owner")
    topologies = relationship("Topology", back_populates="owner")
```

#### 实验模型 (Experiment)
```python
# app/models/experiment.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    protocol_type = Column(String(50))  # TCP, UDP, HTTP, RIP, FTP
    topology_data = Column(JSON)  # 拓扑结构数据
    config = Column(JSON)  # 实验配置
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="experiments")
```

#### 拓扑模型 (Topology)
```python
# app/models/topology.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

class Topology(Base):
    __tablename__ = "topologies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    nodes = Column(JSON)  # 节点数据
    connections = Column(JSON)  # 连接数据
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="topologies")
```

#### 会话模型 (Session)
```python
# app/models/session.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timedelta

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

**交付物**:
- [ ] 数据库模型文件
- [ ] 数据库初始化脚本
- [ ] Alembic 迁移脚本

---

### 1.3 认证系统

**任务描述**: 实现用户认证功能

**具体工作**:

#### 安全工具
```python
# app/core/security.py
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

#### Pydantic Schemas
```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
```

#### API 路由
```python
# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["认证"])

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # 检查用户是否存在
    # 创建新用户
    pass

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # 验证用户
    # 生成 JWT token
    pass

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_user_dependency)
):
    return current_user
```

**交付物**:
- [ ] `app/core/security.py`
- [ ] `app/schemas/user.py`
- [ ] `app/api/auth.py`
- [ ] 认证中间件

---

## 🔌 第二阶段：核心功能

### 2.1 WebSocket 服务

**任务描述**: 实现实时通信服务

**具体工作**:

#### WebSocket 管理器
```python
# app/websocket/manager.py
from fastapi import WebSocket
from typing import Dict, List
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.experiment_rooms: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
    
    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)
    
    async def broadcast_to_experiment(self, message: dict, experiment_id: str):
        # 广播到实验房间
        pass

manager = ConnectionManager()
```

#### WebSocket 处理器
```python
# app/websocket/handler.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
import asyncio

router = APIRouter()

@router.websocket("/ws/experiment/{experiment_id}")
async def experiment_websocket(websocket: WebSocket, experiment_id: str):
    client_id = f"{experiment_id}_{id(websocket)}"
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_json()
            # 处理消息类型
            await handle_message(data, experiment_id, client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast_to_experiment(
            {"type": "disconnect", "client_id": client_id},
            experiment_id
        )

async def handle_message(data: dict, experiment_id: str, client_id: str):
    msg_type = data.get("type")
    
    if msg_type == "packet_send":
        # 发送数据包
        await handle_packet_send(data, experiment_id)
    elif msg_type == "topology_change":
        # 拓扑变化
        await handle_topology_change(data, experiment_id)
    elif msg_type == "config_update":
        # 配置更新
        await handle_config_update(data, experiment_id)
```

#### 消息协议
```python
# app/websocket/protocol.py
from typing import Literal, Dict, Any
from pydantic import BaseModel

class WSMessage(BaseModel):
    type: Literal["packet", "topology", "config", "event"]
    data: Dict[str, Any]
    timestamp: float

class PacketMessage(WSMessage):
    type: Literal["packet"] = "packet"
    data: Dict[str, Any]  # 数据包内容

class TopologyMessage(WSMessage):
    type: Literal["topology"] = "topology"
    data: Dict[str, Any]  # 拓扑数据
```

**交付物**:
- [ ] `app/websocket/manager.py`
- [ ] `app/websocket/handler.py`
- [ ] `app/websocket/protocol.py`

---

### 2.2 协议模拟引擎基础

**任务描述**: 实现协议模拟的基础架构

**具体工作**:

#### 基础协议类
```python
# app/core/protocol/base.py
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from dataclasses import dataclass
from enum import Enum

class ProtocolType(Enum):
    TCP = "tcp"
    UDP = "udp"
    HTTP = "http"
    RIP = "rip"
    FTP = "ftp"

@dataclass
class Packet:
    id: str
    protocol: ProtocolType
    data: Dict[str, Any]
    timestamp: float
    source: str
    destination: str

class BaseProtocol(ABC):
    def __init__(self):
        self.packets: List[Packet] = []
    
    @abstractmethod
    def create_packet(self, data: Dict[str, Any]) -> Packet:
        pass
    
    @abstractmethod
    def process_packet(self, packet: Packet) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        pass
```

#### 协议工厂
```python
# app/core/protocol/factory.py
from app.core.protocol.tcp import TCPProtocol
from app.core.protocol.udp import UDPProtocol
from app.core.protocol.http import HTTPProtocol
from app.core.protocol.rip import RIPProtocol
from app.core.protocol.ftp import FTPProtocol

class ProtocolFactory:
    _protocols = {
        "tcp": TCPProtocol,
        "udp": UDPProtocol,
        "http": HTTPProtocol,
        "rip": RIPProtocol,
        "ftp": FTPProtocol,
    }
    
    @classmethod
    def get_protocol(cls, protocol_type: str):
        protocol_class = cls._protocols.get(protocol_type.lower())
        if not protocol_class:
            raise ValueError(f"Unknown protocol: {protocol_type}")
        return protocol_class()
```

#### 网络拓扑引擎
```python
# app/core/topology/engine.py
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class Node:
    id: str
    type: str  # host, router, switch
    config: Dict[str, Any]
    interfaces: List[Dict[str, Any]]

@dataclass
class Link:
    id: str
    source: str
    destination: str
    source_port: str
    dest_port: str
    status: str = "active"

class TopologyEngine:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.links: Dict[str, Link] = {}
    
    def add_node(self, node: Node):
        self.nodes[node.id] = node
    
    def add_link(self, link: Link):
        self.links[link.id] = link
    
    def remove_link(self, link_id: str):
        if link_id in self.links:
            del self.links[link_id]
    
    def get_path(self, source: str, destination: str) -> List[str]:
        # 计算路由路径
        pass
    
    def forward_packet(self, packet: Packet, current_node: str) -> str:
        # 转发数据包
        pass
```

**交付物**:
- [ ] `app/core/protocol/base.py`
- [ ] `app/core/protocol/factory.py`
- [ ] `app/core/topology/engine.py`

---

## 📚 第三阶段：协议模块

### 3.1 TCP 协议模拟

**任务描述**: 实现 TCP 协议模拟

**具体工作**:

```python
# app/core/protocol/tcp.py
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
from typing import Dict, Any, List
from enum import IntEnum
import uuid

class TCPFlags(IntEnum):
    FIN = 0x01
    SYN = 0x02
    RST = 0x04
    PSH = 0x08
    ACK = 0x10
    URG = 0x20

class TCPState(IntEnum):
    CLOSED = 0
    LISTEN = 1
    SYN_SENT = 2
    SYN_RECEIVED = 3
    ESTABLISHED = 4
    FIN_WAIT_1 = 5
    FIN_WAIT_2 = 6
    CLOSE_WAIT = 7
    CLOSING = 8
    LAST_ACK = 9
    TIME_WAIT = 10

class TCPProtocol(BaseProtocol):
    def __init__(self):
        super().__init__()
        self.connections: Dict[str, Dict[str, Any]] = {}
        self.congestion_control = "reno"  # reno, cubic, bbr
    
    def create_packet(self, data: Dict[str, Any]) -> Packet:
        """创建 TCP 数据包"""
        packet = Packet(
            id=str(uuid.uuid4()),
            protocol=ProtocolType.TCP,
            data={
                "src_port": data.get("src_port", 80),
                "dst_port": data.get("dst_port", 80),
                "seq": data.get("seq", 0),
                "ack": data.get("ack", 0),
                "flags": data.get("flags", TCPFlags.ACK),
                "window_size": data.get("window_size", 65535),
                "payload": data.get("payload", b""),
            },
            timestamp=data.get("timestamp", 0),
            source=data.get("source", ""),
            destination=data.get("destination", ""),
        )
        self.packets.append(packet)
        return packet
    
    def three_way_handshake(self, client: str, server: str) -> List[Packet]:
        """三次握手"""
        packets = []
        
        # SYN
        syn = self.create_packet({
            "src_port": 12345,
            "dst_port": 80,
            "seq": 0,
            "flags": TCPFlags.SYN,
            "source": client,
            "destination": server,
        })
        packets.append(syn)
        
        # SYN-ACK
        syn_ack = self.create_packet({
            "src_port": 80,
            "dst_port": 12345,
            "seq": 0,
            "ack": 1,
            "flags": TCPFlags.SYN | TCPFlags.ACK,
            "source": server,
            "destination": client,
        })
        packets.append(syn_ack)
        
        # ACK
        ack = self.create_packet({
            "src_port": 12345,
            "dst_port": 80,
            "seq": 1,
            "ack": 1,
            "flags": TCPFlags.ACK,
            "source": client,
            "destination": server,
        })
        packets.append(ack)
        
        return packets
    
    def sliding_window_send(self, data: bytes, window_size: int = 3) -> List[Packet]:
        """滑动窗口发送"""
        packets = []
        seq = 0
        chunk_size = 1024
        
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i + chunk_size]
            packet = self.create_packet({
                "seq": seq,
                "payload": chunk,
                "window_size": window_size,
            })
            packets.append(packet)
            seq += len(chunk)
        
        return packets
    
    def fast_retransmit(self, lost_packet: Packet, dup_acks: int) -> List[Packet]:
        """快速重传"""
        if dup_acks >= 3:
            # 触发快速重传
            retransmit = self.create_packet({
                "seq": lost_packet.data["seq"],
                "payload": lost_packet.data["payload"],
                "flags": TCPFlags.ACK,
            })
            return [retransmit]
        return []
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据"""
        return [
            {
                "layer": 4,
                "name": "Transport Layer",
                "protocol": "TCP",
                "fields": {
                    "Source Port": packet.data["src_port"],
                    "Destination Port": packet.data["dst_port"],
                    "Sequence Number": packet.data["seq"],
                    "Acknowledgment Number": packet.data["ack"],
                    "Flags": self._parse_flags(packet.data["flags"]),
                    "Window Size": packet.data["window_size"],
                },
                "hex": self._to_hex(packet.data),
            }
        ]
    
    def _parse_flags(self, flags: int) -> str:
        flag_names = []
        if flags & TCPFlags.SYN: flag_names.append("SYN")
        if flags & TCPFlags.ACK: flag_names.append("ACK")
        if flags & TCPFlags.FIN: flag_names.append("FIN")
        if flags & TCPFlags.RST: flag_names.append("RST")
        if flags & TCPFlags.PSH: flag_names.append("PSH")
        return ", ".join(flag_names)
    
    def _to_hex(self, data: Dict) -> str:
        # 转换为十六进制字符串
        return "54 43 50 ..."
```

**API 端点**:
```python
# app/api/experiment/tcp.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/experiment/tcp", tags=["TCP 实验"])

@router.post("/handshake")
async def tcp_handshake(client: str, server: str):
    """模拟三次握手"""
    protocol = TCPProtocol()
    packets = protocol.three_way_handshake(client, server)
    return {"packets": [p.__dict__ for p in packets]}

@router.post("/send")
async def tcp_send(data: dict):
    """模拟滑动窗口发送"""
    protocol = TCPProtocol()
    packets = protocol.sliding_window_send(
        data["payload"].encode(),
        data.get("window_size", 3)
    )
    return {"packets": [p.__dict__ for p in packets]}

@router.post("/retransmit")
async def tcp_retransmit(packet_id: str, dup_acks: int):
    """模拟快速重传"""
    protocol = TCPProtocol()
    # 查找丢失的数据包
    packets = protocol.fast_retransmit(None, dup_acks)
    return {"packets": [p.__dict__ for p in packets]}
```

**交付物**:
- [ ] `app/core/protocol/tcp.py`
- [ ] `app/api/experiment/tcp.py`

---

### 3.2 UDP 协议模拟

**任务描述**: 实现 UDP 协议模拟

**具体工作**:

```python
# app/core/protocol/udp.py
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
from typing import Dict, Any, List
import uuid

class UDPProtocol(BaseProtocol):
    def __init__(self):
        super().__init__()
        self.mtu = 1500  # 最大传输单元
    
    def create_packet(self, data: Dict[str, Any]) -> Packet:
        """创建 UDP 数据包"""
        packet = Packet(
            id=str(uuid.uuid4()),
            protocol=ProtocolType.UDP,
            data={
                "src_port": data.get("src_port", 0),
                "dst_port": data.get("dst_port", 0),
                "length": data.get("length", 0),
                "checksum": data.get("checksum", 0),
                "payload": data.get("payload", b""),
            },
            timestamp=data.get("timestamp", 0),
            source=data.get("source", ""),
            destination=data.get("destination", ""),
        )
        self.packets.append(packet)
        return packet
    
    def send(self, data: bytes, destination: str) -> List[Packet]:
        """发送 UDP 数据（无连接）"""
        packet = self.create_packet({
            "length": len(data) + 8,  # UDP 头部 8 字节
            "payload": data,
            "destination": destination,
        })
        return [packet]
    
    def broadcast(self, data: bytes, destinations: List[str]) -> List[Packet]:
        """广播发送"""
        packets = []
        for dest in destinations:
            packet = self.create_packet({
                "length": len(data) + 8,
                "payload": data,
                "destination": dest,
            })
            packets.append(packet)
        return packets
    
    def fragment(self, data: bytes) -> List[Dict[str, Any]]:
        """IP 分片"""
        fragments = []
        offset = 0
        fragment_id = uuid.uuid4()
        
        while offset < len(data):
            chunk = data[offset:offset + self.mtu]
            is_more = offset + len(chunk) < len(data)
            
            fragment = {
                "id": str(fragment_id),
                "offset": offset // 8,  # 分片偏移量（以 8 字节为单位）
                "mf": is_more,  # More Fragments
                "df": False,  # Don't Fragment
                "payload": chunk,
            }
            fragments.append(fragment)
            offset += len(chunk)
        
        return fragments
    
    def reassemble(self, fragments: List[Dict[str, Any]]) -> bytes:
        """重组分片"""
        if not fragments:
            return b""
        
        # 按偏移量排序
        sorted_fragments = sorted(fragments, key=lambda x: x["offset"])
        
        # 检查是否完整
        data = b""
        for frag in sorted_fragments:
            data += frag["payload"]
        
        return data
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据"""
        return [
            {
                "layer": 4,
                "name": "Transport Layer",
                "protocol": "UDP",
                "fields": {
                    "Source Port": packet.data["src_port"],
                    "Destination Port": packet.data["dst_port"],
                    "Length": packet.data["length"],
                    "Checksum": hex(packet.data["checksum"]),
                },
                "hex": self._to_hex(packet.data),
            }
        ]
    
    def _to_hex(self, data: Dict) -> str:
        return "55 44 50 ..."
```

**API 端点**:
```python
# app/api/experiment/udp.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/experiment/udp", tags=["UDP 实验"])

@router.post("/send")
async def udp_send(data: dict):
    """发送 UDP 数据"""
    protocol = UDPProtocol()
    packets = protocol.send(data["payload"].encode(), data["destination"])
    return {"packets": [p.__dict__ for p in packets]}

@router.post("/broadcast")
async def udp_broadcast(data: dict):
    """UDP 广播"""
    protocol = UDPProtocol()
    packets = protocol.broadcast(data["payload"].encode(), data["destinations"])
    return {"packets": [p.__dict__ for p in packets]}

@router.post("/fragment")
async def udp_fragment(data: dict):
    """IP 分片"""
    protocol = UDPProtocol()
    protocol.mtu = data.get("mtu", 1500)
    fragments = protocol.fragment(data["payload"].encode())
    return {"fragments": fragments}

@router.post("/reassemble")
async def udp_reassemble(fragments: list):
    """重组分片"""
    protocol = UDPProtocol()
    data = protocol.reassemble(fragments)
    return {"data": data.decode()}
```

**交付物**:
- [ ] `app/core/protocol/udp.py`
- [ ] `app/api/experiment/udp.py`

---

### 3.3 HTTP 协议模拟

**任务描述**: 实现 HTTP 协议模拟

**具体工作**:

```python
# app/core/protocol/http.py
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
from typing import Dict, Any, List, Optional
import uuid
import json

class HTTPMethod:
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"

class HTTPStatus:
    OK = 200
    NOT_FOUND = 404
    INTERNAL_ERROR = 500

class HTTPProtocol(BaseProtocol):
    def __init__(self):
        super().__init__()
        self.use_https = False
    
    def create_request(self, method: str, url: str, headers: Dict[str, str] = None, body: Any = None) -> Packet:
        """创建 HTTP 请求"""
        request_line = f"{method} {url} HTTP/1.1"
        header_lines = [f"{k}: {v}" for k, v in (headers or {}).items()]
        header_text = "\r\n".join(header_lines)
        body_text = json.dumps(body) if body else ""
        
        raw = f"{request_line}\r\n{header_text}\r\n\r\n{body_text}"
        
        packet = Packet(
            id=str(uuid.uuid4()),
            protocol=ProtocolType.HTTP,
            data={
                "type": "request",
                "method": method,
                "url": url,
                "headers": headers or {},
                "body": body,
                "raw": raw,
            },
            timestamp=0,
            source="client",
            destination="server",
        )
        self.packets.append(packet)
        return packet
    
    def create_response(self, status: int, headers: Dict[str, str] = None, body: Any = None) -> Packet:
        """创建 HTTP 响应"""
        status_text = {200: "OK", 404: "Not Found", 500: "Internal Server Error"}
        status_line = f"HTTP/1.1 {status} {status_text.get(status, 'Unknown')}"
        header_lines = [f"{k}: {v}" for k, v in (headers or {}).items()]
        header_text = "\r\n".join(header_lines)
        body_text = json.dumps(body) if body else ""
        
        raw = f"{status_line}\r\n{header_text}\r\n\r\n{body_text}"
        
        packet = Packet(
            id=str(uuid.uuid4()),
            protocol=ProtocolType.HTTP,
            data={
                "type": "response",
                "status": status,
                "headers": headers or {},
                "body": body,
                "raw": raw,
            },
            timestamp=0,
            source="server",
            destination="client",
        )
        self.packets.append(packet)
        return packet
    
    def handle_request(self, request: Packet) -> Packet:
        """处理 HTTP 请求"""
        method = request.data["method"]
        url = request.data["url"]
        
        # 简单路由
        if url == "/api/data":
            return self.create_response(200, {"Content-Type": "application/json"}, {"data": "Hello"})
        else:
            return self.create_response(404, {"Content-Type": "text/plain"}, {"error": "Not Found"})
    
    def tls_handshake(self) -> List[Dict[str, Any]]:
        """TLS 握手过程"""
        return [
            {"step": 1, "name": "ClientHello", "description": "客户端发送支持的加密套件"},
            {"step": 2, "name": "ServerHello", "description": "服务器选择加密套件"},
            {"step": 3, "name": "Certificate", "description": "服务器发送证书"},
            {"step": 4, "name": "ServerKeyExchange", "description": "密钥交换"},
            {"step": 5, "name": "ServerHelloDone", "description": "服务器握手完成"},
            {"step": 6, "name": "ClientKeyExchange", "description": "客户端密钥交换"},
            {"step": 7, "name": "ChangeCipherSpec", "description": "切换加密"},
            {"step": 8, "name": "Finished", "description": "握手完成"},
        ]
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据"""
        layers = [
            {
                "layer": 7,
                "name": "Application Layer",
                "protocol": "HTTP",
                "fields": packet.data,
                "raw": packet.data["raw"],
            }
        ]
        
        if self.use_https:
            layers.append({
                "layer": 6,
                "name": "Presentation Layer",
                "protocol": "TLS",
                "fields": {"encrypted": True},
            })
        
        return layers
```

**API 端点**:
```python
# app/api/experiment/http.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/experiment/http", tags=["HTTP 实验"])

@router.post("/request")
async def http_request(data: dict):
    """发送 HTTP 请求"""
    protocol = HTTPProtocol()
    request = protocol.create_request(
        data["method"],
        data["url"],
        data.get("headers", {}),
        data.get("body")
    )
    response = protocol.handle_request(request)
    return {
        "request": request.__dict__,
        "response": response.__dict__,
    }

@router.get("/tls-handshake")
async def tls_handshake():
    """TLS 握手过程"""
    protocol = HTTPProtocol()
    return {"steps": protocol.tls_handshake()}
```

**交付物**:
- [ ] `app/core/protocol/http.py`
- [ ] `app/api/experiment/http.py`

---

### 3.4 RIP 协议模拟

**任务描述**: 实现 RIP 路由协议模拟

**具体工作**:

```python
# app/core/protocol/rip.py
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
from typing import Dict, Any, List
import uuid

class RIPProtocol(BaseProtocol):
    def __init__(self):
        super().__init__()
        self.port = 520
        self.max_hop = 15
        self.update_interval = 30  # 秒
        self.routing_tables: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self.split_horizon = True
        self.poison_reverse = True
    
    def create_update_packet(self, router_id: str, routes: List[Dict[str, Any]]) -> Packet:
        """创建 RIP 更新包"""
        packet = Packet(
            id=str(uuid.uuid4()),
            protocol=ProtocolType.RIP,
            data={
                "command": 2,  # Response
                "version": 2,
                "routes": [
                    {
                        "ip": r["ip"],
                        "mask": r["mask"],
                        "next_hop": r.get("next_hop", "0.0.0.0"),
                        "metric": r["metric"],
                    }
                    for r in routes
                ],
            },
            timestamp=0,
            source=router_id,
            destination="224.0.0.9",  # RIP 组播地址
        )
        self.packets.append(packet)
        return packet
    
    def update_routing_table(self, router_id: str, received_routes: List[Dict[str, Any]], neighbor: str):
        """更新路由表"""
        if router_id not in self.routing_tables:
            self.routing_tables[router_id] = {}
        
        table = self.routing_tables[router_id]
        
        for route in received_routes:
            dest = route["ip"]
            metric = route["metric"] + 1  # 经过邻居，跳数 +1
            
            # 水平分割检查
            if self.split_horizon and route.get("next_hop") == neighbor:
                continue
            
            # 毒性逆转
            if self.poison_reverse and metric > self.max_hop:
                metric = 16  # 不可达
            
            if dest not in table or table[dest]["metric"] > metric:
                table[dest] = {
                    "next_hop": neighbor,
                    "metric": min(metric, 16),
                }
    
    def simulate_convergence(self, routers: List[str], initial_routes: Dict[str, List[Dict]]):
        """模拟路由收敛"""
        updates = []
        
        # 初始化路由表
        for router_id, routes in initial_routes.items():
            for route in routes:
                self.update_routing_table(router_id, [route], "direct")
        
        # 模拟更新传播
        for _ in range(len(routers)):
            for router_id in routers:
                table = self.routing_tables.get(router_id, {})
                routes = [
                    {"ip": dest, "mask": "255.255.255.0", "metric": info["metric"]}
                    for dest, info in table.items()
                ]
                if routes:
                    packet = self.create_update_packet(router_id, routes)
                    updates.append(packet)
        
        return updates
    
    def handle_link_failure(self, router_id: str, failed_neighbor: str):
        """处理链路故障"""
        table = self.routing_tables.get(router_id, {})
        
        # 标记通过该邻居的路由为不可达
        for dest, info in table.items():
            if info["next_hop"] == failed_neighbor:
                info["metric"] = 16
        
        # 发送毒性逆转更新
        routes = [
            {"ip": dest, "mask": "255.255.255.0", "metric": 16}
            for dest, info in table.items()
            if info["next_hop"] == failed_neighbor
        ]
        return self.create_update_packet(router_id, routes)
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据"""
        return [
            {
                "layer": 5,
                "name": "Session Layer",
                "protocol": "RIP",
                "fields": {
                    "Command": packet.data["command"],
                    "Version": packet.data["version"],
                    "Routes": packet.data["routes"],
                },
            }
        ]
```

**API 端点**:
```python
# app/api/experiment/rip.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/experiment/rip", tags=["RIP 实验"])

@router.post("/update")
async def rip_update(data: dict):
    """发送 RIP 更新"""
    protocol = RIPProtocol()
    packet = protocol.create_update_packet(data["router_id"], data["routes"])
    return {"packet": packet.__dict__}

@router.post("/convergence")
async def rip_convergence(data: dict):
    """模拟路由收敛"""
    protocol = RIPProtocol()
    updates = protocol.simulate_convergence(data["routers"], data["initial_routes"])
    return {
        "updates": [p.__dict__ for p in updates],
        "routing_tables": protocol.routing_tables,
    }

@router.post("/link-failure")
async def rip_link_failure(router_id: str, failed_neighbor: str):
    """处理链路故障"""
    protocol = RIPProtocol()
    packet = protocol.handle_link_failure(router_id, failed_neighbor)
    return {"packet": packet.__dict__}
```

**交付物**:
- [ ] `app/core/protocol/rip.py`
- [ ] `app/api/experiment/rip.py`

---

### 3.5 FTP 协议模拟

**任务描述**: 实现 FTP 协议模拟

**具体工作**:

```python
# app/core/protocol/ftp.py
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
from typing import Dict, Any, List
import uuid

class FTPMode:
    ACTIVE = "active"
    PASSIVE = "passive"

class FTPCommand:
    USER = "USER"
    PASS = "PASS"
    LIST = "LIST"
    RETR = "RETR"
    STOR = "STOR"
    QUIT = "QUIT"

class FTPResponse:
    OK = 200
    LOGIN_SUCCESS = 230
    FILE_NOT_FOUND = 550
    PASSWORD_REQUIRED = 331

class FTPProtocol(BaseProtocol):
    def __init__(self):
        super().__init__()
        self.control_port = 21
        self.data_port = 20
        self.mode = FTPMode.ACTIVE
        self.session_data: Dict[str, Any] = {}
    
    def create_command_packet(self, command: str, argument: str = "") -> Packet:
        """创建 FTP 命令包"""
        raw = f"{command} {argument}".strip()
        
        packet = Packet(
            id=str(uuid.uuid4()),
            protocol=ProtocolType.FTP,
            data={
                "type": "command",
                "command": command,
                "argument": argument,
                "raw": raw,
            },
            timestamp=0,
            source="client",
            destination="server",
        )
        self.packets.append(packet)
        return packet
    
    def create_response_packet(self, code: int, message: str) -> Packet:
        """创建 FTP 响应包"""
        raw = f"{code} {message}"
        
        packet = Packet(
            id=str(uuid.uuid4()),
            protocol=ProtocolType.FTP,
            data={
                "type": "response",
                "code": code,
                "message": message,
                "raw": raw,
            },
            timestamp=0,
            source="server",
            destination="client",
        )
        self.packets.append(packet)
        return packet
    
    def login(self, username: str, password: str) -> List[Packet]:
        """FTP 登录流程"""
        packets = []
        
        # USER
        user_cmd = self.create_command_packet(FTPCommand.USER, username)
        packets.append(user_cmd)
        
        # 331 Password required
        resp1 = self.create_response_packet(FTPResponse.PASSWORD_REQUIRED, "Password required")
        packets.append(resp1)
        
        # PASS
        pass_cmd = self.create_command_packet(FTPCommand.PASS, password)
        packets.append(pass_cmd)
        
        # 230 Login successful
        resp2 = self.create_response_packet(FTPResponse.LOGIN_SUCCESS, "Login successful")
        packets.append(resp2)
        
        self.session_data["username"] = username
        self.session_data["logged_in"] = True
        
        return packets
    
    def setup_data_connection(self, mode: str = FTPMode.ACTIVE) -> List[Dict[str, Any]]:
        """建立数据连接"""
        self.mode = mode
        
        if mode == FTPMode.ACTIVE:
            # 主动模式：服务器连接客户端
            return [
                {"step": 1, "action": "PORT command", "description": "客户端发送 PORT 命令告知数据端口"},
                {"step": 2, "action": "Server connects", "description": "服务器主动连接客户端数据端口"},
            ]
        else:
            # 被动模式：客户端连接服务器
            return [
                {"step": 1, "action": "PASV command", "description": "客户端发送 PASV 命令"},
                {"step": 2, "action": "Server responds", "description": "服务器返回被动模式端口"},
                {"step": 3, "action": "Client connects", "description": "客户端连接服务器数据端口"},
            ]
    
    def upload_file(self, filename: str, data: bytes) -> List[Packet]:
        """上传文件"""
        packets = []
        
        # STOR 命令
        stor_cmd = self.create_command_packet(FTPCommand.STOR, filename)
        packets.append(stor_cmd)
        
        # 数据连接传输文件
        data_packet = Packet(
            id=str(uuid.uuid4()),
            protocol=ProtocolType.FTP,
            data={
                "type": "data",
                "filename": filename,
                "size": len(data),
                "progress": 100,
            },
            timestamp=0,
            source="client",
            destination="server",
        )
        packets.append(data_packet)
        
        # 226 Transfer complete
        resp = self.create_response_packet(FTPResponse.OK, "Transfer complete")
        packets.append(resp)
        
        return packets
    
    def download_file(self, filename: str) -> List[Packet]:
        """下载文件"""
        packets = []
        
        # RETR 命令
        retr_cmd = self.create_command_packet(FTPCommand.RETR, filename)
        packets.append(retr_cmd)
        
        # 模拟文件数据
        data_packet = Packet(
            id=str(uuid.uuid4()),
            protocol=ProtocolType.FTP,
            data={
                "type": "data",
                "filename": filename,
                "size": 1024,
                "progress": 100,
            },
            timestamp=0,
            source="server",
            destination="client",
        )
        packets.append(data_packet)
        
        return packets
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据"""
        return [
            {
                "layer": 7,
                "name": "Application Layer",
                "protocol": "FTP",
                "fields": packet.data,
                "raw": packet.data.get("raw", ""),
            }
        ]
```

**API 端点**:
```python
# app/api/experiment/ftp.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/experiment/ftp", tags=["FTP 实验"])

@router.post("/login")
async def ftp_login(data: dict):
    """FTP 登录"""
    protocol = FTPProtocol()
    packets = protocol.login(data["username"], data["password"])
    return {"packets": [p.__dict__ for p in packets]}

@router.post("/data-connection")
async def ftp_data_connection(mode: str = "active"):
    """建立数据连接"""
    protocol = FTPProtocol()
    steps = protocol.setup_data_connection(mode)
    return {"steps": steps}

@router.post("/upload")
async def ftp_upload(data: dict):
    """上传文件"""
    protocol = FTPProtocol()
    packets = protocol.upload_file(data["filename"], b"file content")
    return {"packets": [p.__dict__ for p in packets]}

@router.post("/download")
async def ftp_download(filename: str):
    """下载文件"""
    protocol = FTPProtocol()
    packets = protocol.download_file(filename)
    return {"packets": [p.__dict__ for p in packets]}
```

**交付物**:
- [ ] `app/core/protocol/ftp.py`
- [ ] `app/api/experiment/ftp.py`

---

## 🔬 第四阶段：自由实验室支持

### 4.1 拓扑管理 API

**任务描述**: 实现拓扑管理接口

**具体工作**:

```python
# app/api/topology.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

router = APIRouter(prefix="/api/topology", tags=["拓扑管理"])

@router.post("/create")
async def create_topology(data: dict, db: Session = Depends(get_db)):
    """创建拓扑"""
    topology = Topology(
        name=data["name"],
        description=data.get("description"),
        nodes=data["nodes"],
        connections=data["connections"],
        owner_id=data["owner_id"],
    )
    db.add(topology)
    db.commit()
    db.refresh(topology)
    return topology

@router.get("/{topology_id}")
async def get_topology(topology_id: int, db: Session = Depends(get_db)):
    """获取拓扑详情"""
    topology = db.query(Topology).filter(Topology.id == topology_id).first()
    if not topology:
        raise HTTPException(404, "Topology not found")
    return topology

@router.put("/{topology_id}")
async def update_topology(topology_id: int, data: dict, db: Session = Depends(get_db)):
    """更新拓扑"""
    topology = db.query(Topology).filter(Topology.id == topology_id).first()
    if not topology:
        raise HTTPException(404, "Topology not found")
    
    topology.nodes = data.get("nodes", topology.nodes)
    topology.connections = data.get("connections", topology.connections)
    db.commit()
    return topology

@router.delete("/{topology_id}")
async def delete_topology(topology_id: int, db: Session = Depends(get_db)):
    """删除拓扑"""
    topology = db.query(Topology).filter(Topology.id == topology_id).first()
    if not topology:
        raise HTTPException(404, "Topology not found")
    db.delete(topology)
    db.commit()
    return {"message": "Deleted"}
```

**交付物**:
- [ ] `app/api/topology.py`

---

### 4.2 实验管理 API

**任务描述**: 实现实验管理接口

**具体工作**:

```python
# app/api/experiment.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

router = APIRouter(prefix="/api/experiment", tags=["实验管理"])

@router.post("/create")
async def create_experiment(data: dict, db: Session = Depends(get_db)):
    """创建实验"""
    experiment = Experiment(
        title=data["title"],
        description=data.get("description"),
        protocol_type=data["protocol_type"],
        topology_data=data.get("topology_data"),
        config=data.get("config", {}),
        owner_id=data["owner_id"],
    )
    db.add(experiment)
    db.commit()
    db.refresh(experiment)
    return experiment

@router.get("/{experiment_id}")
async def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """获取实验详情"""
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(404, "Experiment not found")
    return experiment

@router.get("/user/{user_id}")
async def list_user_experiments(user_id: int, db: Session = Depends(get_db)):
    """列出用户的所有实验"""
    experiments = db.query(Experiment).filter(Experiment.owner_id == user_id).all()
    return experiments
```

**交付物**:
- [ ] `app/api/experiment.py`

---

## 🧪 第五阶段：测试与优化

### 5.1 单元测试

**任务描述**: 编写后端单元测试

**具体工作**:
- [ ] 协议模拟测试
- [ ] API 端点测试
- [ ] 数据库操作测试
- [ ] WebSocket 测试

**测试示例**:
```python
# tests/test_tcp.py
import pytest
from app.core.protocol.tcp import TCPProtocol, TCPFlags

def test_three_way_handshake():
    protocol = TCPProtocol()
    packets = protocol.three_way_handshake("client", "server")
    
    assert len(packets) == 3
    assert packets[0].data["flags"] == TCPFlags.SYN
    assert packets[1].data["flags"] == TCPFlags.SYN | TCPFlags.ACK
    assert packets[2].data["flags"] == TCPFlags.ACK

def test_sliding_window():
    protocol = TCPProtocol()
    data = b"x" * 5000
    packets = protocol.sliding_window_send(data, window_size=3)
    
    assert len(packets) > 0
    assert sum(len(p.data["payload"]) for p in packets) == len(data)
```

**交付物**:
- [ ] `tests/test_tcp.py`
- [ ] `tests/test_udp.py`
- [ ] `tests/test_http.py`
- [ ] `tests/test_rip.py`
- [ ] `tests/test_ftp.py`

---

### 5.2 性能优化

**任务描述**: 优化后端性能

**具体工作**:
- [ ] 数据库查询优化（索引、缓存）
- [ ] WebSocket 连接池
- [ ] 异步处理
- [ ] 内存管理

**交付物**:
- [ ] 性能测试报告
- [ ] 优化建议文档

---

## 📦 交付清单

### 代码交付
- [ ] 完整的源代码
- [ ] 类型注解完整
- [ ] 代码注释完整
- [ ] 测试用例

### 文档交付
- [ ] API 文档（自动生成）
- [ ] 部署指南
- [ ] 开发指南

### 构建产物
- [ ] Dockerfile
- [ ] docker-compose.yml
- [ ] 生产环境配置

---

## 📞 联系方式

如有问题，请联系：
- 项目负责人
- 技术文档：`PROJECT_DESIGN.md`
- 前端任务：`FRONTEND_TASKS.md`
