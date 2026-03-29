"""
WebSocket 路由模块
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import asyncio

router = APIRouter(tags=["WebSocket"])

# 连接管理器（简化版）
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
    
    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)

manager = ConnectionManager()


@router.websocket("/ws/experiment/{experiment_id}")
async def experiment_websocket(websocket: WebSocket, experiment_id: str):
    """
    实验 WebSocket 连接
    
    用于实时推送实验数据和状态更新
    """
    client_id = f"{experiment_id}_{id(websocket)}"
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_json()
            # 处理接收的消息
            msg_type = data.get("type")
            
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
            elif msg_type == "packet_send":
                # 广播数据包更新
                await manager.broadcast({
                    "type": "packet",
                    "data": data.get("data"),
                })
            elif msg_type == "topology_change":
                # 广播拓扑变化
                await manager.broadcast({
                    "type": "topology",
                    "data": data.get("data"),
                })
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast({
            "type": "event",
            "data": {"event": "client_disconnect", "client_id": client_id}
        })
