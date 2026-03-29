"""
拓扑管理 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.topology import Topology
from app.models.user import User
from app.schemas.topology import TopologyCreate, TopologyResponse, TopologyUpdate
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/topology", tags=["拓扑管理"])


@router.post("/create", response_model=TopologyResponse)
async def create_topology(
    topology_data: TopologyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    创建拓扑

    - **name**: 拓扑名称
    - **description**: 拓扑描述
    - **nodes**: 节点数据 (JSON)
    - **connections**: 连接数据 (JSON)
    """
    db_topology = Topology(
        name=topology_data.name,
        description=topology_data.description,
        nodes=topology_data.nodes,
        connections=topology_data.connections,
        owner_id=current_user.id,
    )
    db.add(db_topology)
    db.commit()
    db.refresh(db_topology)
    return db_topology


@router.get("/{topology_id}", response_model=TopologyResponse)
async def get_topology(
    topology_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取拓扑详情"""
    topology = db.query(Topology).filter(Topology.id == topology_id).first()
    if not topology:
        raise HTTPException(status_code=404, detail="拓扑不存在")
    
    # 检查权限
    if topology.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权访问此拓扑")
    
    return topology


@router.put("/{topology_id}", response_model=TopologyResponse)
async def update_topology(
    topology_id: int,
    topology_data: TopologyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新拓扑"""
    topology = db.query(Topology).filter(Topology.id == topology_id).first()
    if not topology:
        raise HTTPException(status_code=404, detail="拓扑不存在")
    
    # 检查权限
    if topology.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权修改此拓扑")
    
    # 更新字段
    if topology_data.name is not None:
        topology.name = topology_data.name
    if topology_data.description is not None:
        topology.description = topology_data.description
    if topology_data.nodes is not None:
        topology.nodes = topology_data.nodes
    if topology_data.connections is not None:
        topology.connections = topology_data.connections
    
    db.commit()
    db.refresh(topology)
    return topology


@router.delete("/{topology_id}")
async def delete_topology(
    topology_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除拓扑"""
    topology = db.query(Topology).filter(Topology.id == topology_id).first()
    if not topology:
        raise HTTPException(status_code=404, detail="拓扑不存在")
    
    # 检查权限
    if topology.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除此拓扑")
    
    db.delete(topology)
    db.commit()
    return {"message": "拓扑已删除"}


@router.get("/my", response_model=List[TopologyResponse])
async def list_my_topologies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """列出当前用户的所有拓扑"""
    topologies = db.query(Topology).filter(Topology.owner_id == current_user.id).all()
    return topologies
