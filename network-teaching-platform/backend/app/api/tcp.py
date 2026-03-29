"""
TCP 协议实验 API 路由
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from app.core.protocol.tcp import TCPProtocol, TCPFlags

router = APIRouter(tags=["TCP 实验"])


@router.post("/handshake")
async def tcp_handshake(client: str, server: str):
    """
    模拟 TCP 三次握手

    - **client**: 客户端地址
    - **server**: 服务器地址
    """
    protocol = TCPProtocol()
    packets = protocol.three_way_handshake(client, server)
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": {
                    "src_port": p.data["src_port"],
                    "dst_port": p.data["dst_port"],
                    "seq": p.data["seq"],
                    "ack": p.data["ack"],
                    "flags": p.data["flags"],
                    "flags_text": protocol._parse_flags(p.data["flags"]),
                    "window_size": p.data["window_size"],
                },
                "source": p.source,
                "destination": p.destination,
            }
            for p in packets
        ]
    }


@router.post("/four-way-handshake")
async def tcp_four_way_handshake(client: str, server: str):
    """
    模拟 TCP 四次挥手（连接关闭）

    - **client**: 客户端地址
    - **server**: 服务器地址
    """
    protocol = TCPProtocol()
    packets = protocol.four_way_handshake(client, server)
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": {
                    "src_port": p.data["src_port"],
                    "dst_port": p.data["dst_port"],
                    "seq": p.data["seq"],
                    "ack": p.data["ack"],
                    "flags": p.data["flags"],
                    "flags_text": protocol._parse_flags(p.data["flags"]),
                },
                "source": p.source,
                "destination": p.destination,
            }
            for p in packets
        ]
    }


@router.post("/send")
async def tcp_send(payload: str, window_size: int = 3, source: str = "", destination: str = ""):
    """
    模拟 TCP 滑动窗口发送

    - **payload**: 要发送的数据
    - **window_size**: 窗口大小
    - **source**: 源地址
    - **destination**: 目标地址
    """
    protocol = TCPProtocol()
    packets = protocol.sliding_window_send(payload.encode(), window_size)
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": {
                    "seq": p.data["seq"],
                    "payload_size": len(p.data["payload"]),
                    "window_size": p.data["window_size"],
                },
                "source": p.source,
                "destination": p.destination,
            }
            for p in packets
        ]
    }


@router.post("/congestion-send")
async def tcp_congestion_send(
    payload: str,
    algorithm: str = "reno",
    connection_key: str = "default"
):
    """
    模拟 TCP 拥塞控制发送

    - **payload**: 要发送的数据
    - **algorithm**: 拥塞控制算法 (reno/cubic/bbr)
    - **connection_key**: 连接标识
    """
    protocol = TCPProtocol()
    protocol.set_congestion_control(algorithm)
    packets = protocol.congestion_control_send(payload.encode(), connection_key)
    state = protocol.get_congestion_state(connection_key)
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": {
                    "seq": p.data["seq"],
                    "payload_size": len(p.data["payload"]),
                    "window_size": p.data["window_size"],
                },
            }
            for p in packets
        ],
        "congestion_state": state,
    }


@router.post("/retransmit")
async def tcp_retransmit(packet_id: str, dup_acks: int = 3):
    """
    模拟 TCP 快速重传

    - **packet_id**: 丢失的数据包 ID
    - **dup_acks**: 重复 ACK 数量
    """
    protocol = TCPProtocol()
    # 模拟丢失的数据包
    lost_packet = protocol.create_packet({
        "seq": 1024,
        "payload": b"lost data",
    })
    packets = protocol.fast_retransmit(lost_packet, dup_acks)
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": {
                    "seq": p.data["seq"],
                    "retransmit": True,
                },
            }
            for p in packets
        ]
    }


@router.post("/simulate-loss")
async def tcp_simulate_loss(packet_id: str, loss_rate: float = 0.1):
    """
    模拟 TCP 丢包

    - **packet_id**: 数据包 ID
    - **loss_rate**: 丢包率 (0-1)
    """
    protocol = TCPProtocol()
    packet = protocol.create_packet({
        "seq": 1024,
        "payload": b"test data",
    })
    result = protocol.simulate_packet_loss(packet, loss_rate)
    return result


@router.get("/congestion-comparison")
async def tcp_congestion_comparison():
    """
    比较不同拥塞控制算法的性能

    返回 Reno、Cubic、BBR 三种算法的窗口增长曲线
    """
    algorithms = {
        "reno": [],
        "cubic": [],
        "bbr": [],
    }

    for algo_name in algorithms.keys():
        protocol = TCPProtocol()
        protocol.set_congestion_control(algo_name)
        cc = protocol.cc_algorithms.get(algo_name)

        if cc:
            # 模拟 20 次 ACK 接收
            for _ in range(20):
                cc.on_ack_received()
                algorithms[algo_name].append({
                    "cwnd": round(cc.cwnd, 2),
                    "ssthresh": round(cc.ssthresh, 2),
                })

    return {
        "comparison": algorithms,
        "description": {
            "reno": "Reno: 慢启动 + 拥塞避免 + 快速重传/快速恢复",
            "cubic": "Cubic: Linux 默认算法，基于立方函数的窗口增长",
            "bbr": "BBR: Google 开发，基于带宽和 RTT 的模型",
        }
    }
