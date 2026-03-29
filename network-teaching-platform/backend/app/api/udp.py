"""
UDP 协议实验 API 路由
"""
from fastapi import APIRouter
from typing import List

from app.core.protocol.udp import UDPProtocol

router = APIRouter(tags=["UDP 实验"])


@router.post("/send")
async def udp_send(payload: str, src_port: int = 0, dst_port: int = 0, source: str = "", destination: str = ""):
    """
    模拟 UDP 发送
    
    - **payload**: 要发送的数据
    - **src_port**: 源端口
    - **dst_port**: 目标端口
    - **source**: 源地址
    - **destination**: 目标地址
    """
    protocol = UDPProtocol()
    packets = protocol.send(payload.encode(), destination)
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": {
                    "src_port": p.data["src_port"],
                    "dst_port": p.data["dst_port"],
                    "length": p.data["length"],
                    "payload": p.data["payload"].decode() if isinstance(p.data["payload"], bytes) else p.data["payload"],
                },
                "source": p.source,
                "destination": p.destination,
            }
        ]
    }


@router.post("/broadcast")
async def udp_broadcast(payload: str, destinations: List[str], src_port: int = 0, dst_port: int = 0):
    """
    模拟 UDP 广播
    
    - **payload**: 广播数据
    - **destinations**: 目标地址列表
    """
    protocol = UDPProtocol()
    packets = protocol.broadcast(payload.encode(), destinations)
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": {
                    "src_port": p.data["src_port"],
                    "dst_port": p.data["dst_port"],
                    "length": p.data["length"],
                },
                "destination": p.destination,
            }
            for p in packets
        ]
    }


@router.post("/fragment")
async def udp_fragment(payload: str, mtu: int = 1500):
    """
    模拟 IP 分片
    
    - **payload**: 要分片的数据
    - **mtu**: 最大传输单元
    """
    protocol = UDPProtocol()
    protocol.mtu = mtu
    fragments = protocol.fragment(payload.encode())
    return {
        "fragments": fragments
    }


@router.post("/reassemble")
async def udp_reassemble(fragments: list):
    """
    重组分片
    
    - **fragments**: 分片列表
    """
    protocol = UDPProtocol()
    data = protocol.reassemble(fragments)
    return {
        "data": data.decode() if data else ""
    }
