"""
拓扑 Schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List


class TopologyBase(BaseModel):
    """拓扑基础 Schema"""
    name: str = Field(..., min_length=1, max_length=100, description="拓扑名称")
    description: Optional[str] = Field(None, description="拓扑描述")


class TopologyCreate(TopologyBase):
    """创建拓扑 Schema"""
    nodes: Dict[str, Any] = Field(..., description="节点数据")
    connections: Dict[str, Any] = Field(..., description="连接数据")


class TopologyUpdate(BaseModel):
    """更新拓扑 Schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    nodes: Optional[Dict[str, Any]] = None
    connections: Optional[Dict[str, Any]] = None


class TopologyResponse(TopologyBase):
    """拓扑响应 Schema"""
    id: int
    nodes: Dict[str, Any]
    connections: Dict[str, Any]
    owner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class NodeConfig(BaseModel):
    """节点配置 Schema"""
    ip: Optional[str] = None
    subnet_mask: Optional[str] = None
    gateway: Optional[str] = None
    dns: Optional[str] = None


class Node(BaseModel):
    """节点 Schema"""
    id: str
    type: str  # host, router, switch, cloud
    config: Optional[NodeConfig] = None
    position: Dict[str, float]  # {x, y}


class Connection(BaseModel):
    """连接 Schema"""
    id: str
    source: str
    destination: str
    source_port: Optional[str] = None
    dest_port: Optional[str] = None
    type: str = "ethernet"  # ethernet, serial
    status: str = "active"  # active, inactive
