"""
实验 Schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List


class ExperimentBase(BaseModel):
    """实验基础 Schema"""
    title: str = Field(..., min_length=1, max_length=200, description="实验标题")
    description: Optional[str] = Field(None, description="实验描述")
    protocol_type: str = Field(..., description="协议类型 (tcp/udp/http/rip/ftp)")


class ExperimentCreate(ExperimentBase):
    """创建实验 Schema"""
    topology_data: Optional[Dict[str, Any]] = Field(None, description="拓扑结构数据")
    config: Optional[Dict[str, Any]] = Field(None, description="实验配置参数")


class ExperimentUpdate(BaseModel):
    """更新实验 Schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    topology_data: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None


class ExperimentResponse(ExperimentBase):
    """实验响应 Schema"""
    id: int
    topology_data: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ExperimentListItem(BaseModel):
    """实验列表项 Schema"""
    id: int
    title: str
    protocol_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ExperimentStats(BaseModel):
    """实验统计 Schema"""
    total: int
    by_protocol: Dict[str, int]
