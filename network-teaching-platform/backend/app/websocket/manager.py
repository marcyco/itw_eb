"""
WebSocket 连接管理器
"""
from fastapi import WebSocket
from typing import Dict, List, Set
import asyncio
import json
from datetime import datetime


class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        # 活跃连接：client_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # 实验房间：experiment_id -> set of client_ids
        self.experiment_rooms: Dict[str, Set[str]] = {}
        # 用户连接：user_id -> set of client_ids
        self.user_connections: Dict[int, Set[str]] = {}
    
    async def connect(
        self, 
        websocket: WebSocket, 
        client_id: str,
        user_id: int = None,
        experiment_id: str = None
    ):
        """接受 WebSocket 连接"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
        # 关联用户
        if user_id is not None:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(client_id)
        
        # 加入实验房间
        if experiment_id is not None:
            if experiment_id not in self.experiment_rooms:
                self.experiment_rooms[experiment_id] = set()
            self.experiment_rooms[experiment_id].add(client_id)
    
    def disconnect(self, client_id: str):
        """断开 WebSocket 连接"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        
        # 从用户连接中移除
        for user_id, client_ids in self.user_connections.items():
            if client_id in client_ids:
                client_ids.discard(client_id)
        
        # 从实验房间中移除
        for experiment_id, client_ids in self.experiment_rooms.items():
            if client_id in client_ids:
                client_ids.discard(client_id)
    
    async def send_personal_message(self, message: dict, client_id: str):
        """发送个人消息"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                print(f"发送消息失败：{e}")
                self.disconnect(client_id)
    
    async def broadcast_to_experiment(self, message: dict, experiment_id: str):
        """广播到实验房间"""
        if experiment_id in self.experiment_rooms:
            client_ids = list(self.experiment_rooms[experiment_id])
            for client_id in client_ids:
                await self.send_personal_message(message, client_id)
    
    async def broadcast_to_user(self, message: dict, user_id: int):
        """广播到用户的所有连接"""
        if user_id in self.user_connections:
            client_ids = list(self.user_connections[user_id])
            for client_id in client_ids:
                await self.send_personal_message(message, client_id)
    
    async def broadcast(self, message: dict):
        """广播给所有连接"""
        client_ids = list(self.active_connections.keys())
        for client_id in client_ids:
            await self.send_personal_message(message, client_id)
    
    def get_experiment_participants(self, experiment_id: str) -> List[str]:
        """获取实验参与者"""
        if experiment_id in self.experiment_rooms:
            return list(self.experiment_rooms[experiment_id])
        return []
    
    def is_user_connected(self, user_id: int) -> bool:
        """检查用户是否在线"""
        if user_id in self.user_connections:
            return len(self.user_connections[user_id]) > 0
        return False


# 全局连接管理器实例
manager = ConnectionManager()
