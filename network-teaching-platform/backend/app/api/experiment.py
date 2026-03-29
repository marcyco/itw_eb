"""
实验管理 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.experiment import Experiment
from app.models.user import User
from app.schemas.experiment import ExperimentCreate, ExperimentResponse, ExperimentUpdate
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/experiment", tags=["实验管理"])


@router.post("/create", response_model=ExperimentResponse)
async def create_experiment(
    experiment_data: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    创建实验

    - **title**: 实验标题
    - **description**: 实验描述
    - **protocol_type**: 协议类型 (tcp/udp/http/rip/ftp)
    - **topology_data**: 拓扑结构数据
    - **config**: 实验配置参数
    """
    db_experiment = Experiment(
        title=experiment_data.title,
        description=experiment_data.description,
        protocol_type=experiment_data.protocol_type,
        topology_data=experiment_data.topology_data,
        config=experiment_data.config,
        owner_id=current_user.id,
    )
    db.add(db_experiment)
    db.commit()
    db.refresh(db_experiment)
    return db_experiment


@router.get("/{experiment_id}", response_model=ExperimentResponse)
async def get_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取实验详情"""
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="实验不存在")
    
    # 检查权限（只有所有者可以查看）
    if experiment.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权访问此实验")
    
    return experiment


@router.put("/{experiment_id}", response_model=ExperimentResponse)
async def update_experiment(
    experiment_id: int,
    experiment_data: ExperimentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新实验"""
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="实验不存在")
    
    # 检查权限
    if experiment.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权修改此实验")
    
    # 更新字段
    if experiment_data.title is not None:
        experiment.title = experiment_data.title
    if experiment_data.description is not None:
        experiment.description = experiment_data.description
    if experiment_data.topology_data is not None:
        experiment.topology_data = experiment_data.topology_data
    if experiment_data.config is not None:
        experiment.config = experiment_data.config
    
    db.commit()
    db.refresh(experiment)
    return experiment


@router.delete("/{experiment_id}")
async def delete_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除实验"""
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="实验不存在")
    
    # 检查权限
    if experiment.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除此实验")
    
    db.delete(experiment)
    db.commit()
    return {"message": "实验已删除"}


@router.get("/user/{user_id}", response_model=List[ExperimentResponse])
async def list_user_experiments(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """列出用户的所有实验"""
    # 只能查看自己的实验列表
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权查看此用户的实验")
    
    experiments = db.query(Experiment).filter(Experiment.owner_id == user_id).all()
    return experiments


@router.get("/my", response_model=List[ExperimentResponse])
async def list_my_experiments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """列出当前用户的所有实验"""
    experiments = db.query(Experiment).filter(Experiment.owner_id == current_user.id).all()
    return experiments
