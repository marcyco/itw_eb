"""
WebSocket 处理器
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import Optional
import asyncio
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.websocket.manager import manager
from app.core.security import decode_access_token

router = APIRouter(tags=["WebSocket"])


async def get_user_from_token(token: Optional[str]) -> Optional[User]:
    """从 token 获取用户"""
    if not token:
        return None
    
    # 简单解析 token 获取用户信息
    # 实际应用中应该查询数据库
    payload = decode_access_token(token)
    if payload:
        return {"user_id": payload.get("user_id"), "username": payload.get("sub")}
    return None


@router.websocket("/ws/experiment/{experiment_id}")
async def experiment_websocket(
    websocket: WebSocket,
    experiment_id: str,
    token: Optional[str] = None
):
    """
    实验 WebSocket 连接
    
    用于实时推送实验数据和状态更新
    
    连接参数:
    - experiment_id: 实验 ID
    - token: 认证 token (可选)
    """
    # 生成客户端 ID
    client_id = f"{experiment_id}_{id(websocket)}_{datetime.now().timestamp()}"
    
    # 获取用户信息
    user_info = await get_user_from_token(token)
    user_id = user_info.get("user_id") if user_info else None
    
    # 连接
    await manager.connect(
        websocket, 
        client_id, 
        user_id=user_id,
        experiment_id=experiment_id
    )
    
    try:
        # 发送欢迎消息
        await manager.send_personal_message({
            "type": "connected",
            "client_id": client_id,
            "experiment_id": experiment_id,
            "timestamp": datetime.now().isoformat(),
        }, client_id)
        
        # 处理消息
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "ping":
                # 心跳响应
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat(),
                }, client_id)
                
            elif msg_type == "packet_send":
                # 发送数据包 - 广播给实验中的其他用户
                packet_data = data.get("data", {})
                await manager.broadcast_to_experiment({
                    "type": "packet",
                    "data": {
                        "packet": packet_data,
                        "from_client": client_id,
                        "timestamp": datetime.now().isoformat(),
                    }
                }, experiment_id)
                
            elif msg_type == "topology_change":
                # 拓扑变化 - 广播给实验中的其他用户
                topology_data = data.get("data", {})
                await manager.broadcast_to_experiment({
                    "type": "topology_update",
                    "data": {
                        "topology": topology_data,
                        "from_client": client_id,
                        "timestamp": datetime.now().isoformat(),
                    }
                }, experiment_id)
                
            elif msg_type == "config_update":
                # 配置更新
                config_data = data.get("data", {})
                await manager.broadcast_to_experiment({
                    "type": "config_update",
                    "data": {
                        "config": config_data,
                        "from_client": client_id,
                        "timestamp": datetime.now().isoformat(),
                    }
                }, experiment_id)
                
            elif msg_type == "chat_message":
                # 聊天消息
                message_data = data.get("data", {})
                await manager.broadcast_to_experiment({
                    "type": "chat_message",
                    "data": {
                        "message": message_data,
                        "from_client": client_id,
                        "timestamp": datetime.now().isoformat(),
                    }
                }, experiment_id)
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast_to_experiment({
            "type": "client_disconnect",
            "data": {
                "client_id": client_id,
                "timestamp": datetime.now().isoformat(),
            }
        }, experiment_id)
    except Exception as e:
        print(f"WebSocket 错误：{e}")
        manager.disconnect(client_id)


@router.websocket("/ws/global")
async def global_websocket(websocket: WebSocket):
    """
    全局 WebSocket 连接
    
    用于接收全局通知和广播
    """
    client_id = f"global_{id(websocket)}_{datetime.now().timestamp()}"
    
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            # 处理全局消息
            await manager.send_personal_message({
                "type": "received",
                "data": data,
                "timestamp": datetime.now().isoformat(),
            }, client_id)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
