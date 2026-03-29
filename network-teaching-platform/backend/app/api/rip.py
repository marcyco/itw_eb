"""
RIP 路由协议实验 API 路由
"""
from fastapi import APIRouter
from typing import List, Dict, Any

from app.core.protocol.rip import RIPProtocol

router = APIRouter(tags=["RIP 实验"])


@router.post("/update")
async def rip_update(router_id: str, routes: List[Dict[str, Any]]):
    """
    发送 RIP 更新包
    
    - **router_id**: 路由器 ID
    - **routes**: 路由列表 [{"ip": "192.168.1.0", "mask": "255.255.255.0", "metric": 1}]
    """
    protocol = RIPProtocol()
    packet = protocol.create_update_packet(router_id, routes)
    return {
        "packet": {
            "id": packet.id,
            "protocol": packet.protocol.value,
            "data": packet.data,
            "source": packet.source,
            "destination": packet.destination,
        }
    }


@router.post("/convergence")
async def rip_convergence(routers: List[str], initial_routes: Dict[str, List[Dict]]):
    """
    模拟路由收敛
    
    - **routers**: 路由器列表
    - **initial_routes**: 初始路由配置
    """
    protocol = RIPProtocol()
    updates = protocol.simulate_convergence(routers, initial_routes)
    return {
        "updates": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": p.data,
            }
            for p in updates
        ],
        "routing_tables": protocol.routing_tables,
    }


@router.post("/link-failure")
async def rip_link_failure(router_id: str, failed_neighbor: str):
    """
    处理链路故障
    
    - **router_id**: 路由器 ID
    - **failed_neighbor**: 故障邻居路由器 ID
    """
    protocol = RIPProtocol()
    packet = protocol.handle_link_failure(router_id, failed_neighbor)
    return {
        "packet": {
            "id": packet.id,
            "protocol": packet.protocol.value,
            "data": packet.data,
            "source": packet.source,
            "destination": packet.destination,
        }
    }
