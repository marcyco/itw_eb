"""
TCP 协议模拟
实现三次握手、滑动窗口、拥塞控制、快速重传等功能
"""
from typing import Dict, Any, List
from enum import IntEnum
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
import uuid


class TCPFlags(IntEnum):
    """TCP 标志位"""
    FIN = 0x01
    SYN = 0x02
    RST = 0x04
    PSH = 0x08
    ACK = 0x10
    URG = 0x20


class TCPState(IntEnum):
    """TCP 状态"""
    CLOSED = 0
    LISTEN = 1
    SYN_SENT = 2
    SYN_RECEIVED = 3
    ESTABLISHED = 4
    FIN_WAIT_1 = 5
    FIN_WAIT_2 = 6
    CLOSE_WAIT = 7
    CLOSING = 8
    LAST_ACK = 9
    TIME_WAIT = 10


class CongestionControlAlgorithm:
    """拥塞控制算法接口"""

    def __init__(self):
        self.cwnd = 1  # 拥塞窗口 (MSS 单位)
        self.ssthresh = 65535  # 慢启动阈值
        self.rtt = 0.1  # 往返时间 (秒)

    def on_ack_received(self, dup_acks: int = 0):
        """收到 ACK 时的处理"""
        pass

    def on_packet_loss(self):
        """检测到丢包时的处理"""
        pass

    def get_window_size(self) -> int:
        """获取当前窗口大小"""
        return int(self.cwnd)


class RenoAlgorithm(CongestionControlAlgorithm):
    """Reno 拥塞控制算法"""

    def on_ack_received(self, dup_acks: int = 0):
        if dup_acks >= 3:
            # 快速重传/快速恢复
            self.ssthresh = max(2, int(self.cwnd / 2))
            self.cwnd = self.ssthresh + 3
        elif self.cwnd < self.ssthresh:
            # 慢启动阶段
            self.cwnd *= 2
        else:
            # 拥塞避免阶段
            self.cwnd += 1 / self.cwnd

    def on_packet_loss(self):
        self.ssthresh = max(2, int(self.cwnd / 2))
        self.cwnd = 1


class CubicAlgorithm(CongestionControlAlgorithm):
    """Cubic 拥塞控制算法 (Linux 默认)"""

    def __init__(self):
        super().__init__()
        self.cubic_c = 0.4
        self.w_max = 0
        self.k = 0
        self.t = 0

    def on_ack_received(self, dup_acks: int = 0):
        if dup_acks >= 3:
            self.w_max = self.cwnd
            self.ssthresh = max(2, int(self.cwnd * 0.7))
            self.cwnd = self.ssthresh
            self.k = (self.w_max * (1 - 0.7) / self.cubic_c) ** (1/3)
            self.t = 0
        else:
            self.t += self.rtt
            # Cubic 增长函数
            self.cwnd = self.w_max - self.cubic_c * (self.k - self.t) ** 3

    def on_packet_loss(self):
        self.w_max = self.cwnd
        self.ssthresh = max(2, int(self.cwnd * 0.7))
        self.cwnd = self.ssthresh


class BBRAlgorithm(CongestionControlAlgorithm):
    """BBR 拥塞控制算法 (Google)"""

    def __init__(self):
        super().__init__()
        self.bw = 0  # 带宽估计
        self.rtt_min = float('inf')  # 最小 RTT
        self.pacing_gain = 1.0

    def on_ack_received(self, dup_acks: int = 0):
        if dup_acks >= 3:
            # 进入恢复状态
            self.pacing_gain = 0.8
            self.cwnd = max(2, int(self.cwnd * 0.75))
        else:
            # 探测带宽
            self.pacing_gain = 1.25
            self.cwnd = int(self.bw * self.rtt_min)

    def on_packet_loss(self):
        self.pacing_gain = 0.8
        self.cwnd = max(2, int(self.cwnd * 0.75))


class TCPProtocol(BaseProtocol):
    """TCP 协议模拟器"""

    def __init__(self):
        super().__init__()
        self.connections: Dict[str, Dict[str, Any]] = {}
        self.congestion_control = "reno"  # reno, cubic, bbr
        self.states: Dict[str, TCPState] = {}
        self.cc_algorithms: Dict[str, CongestionControlAlgorithm] = {}

        # 初始化拥塞控制算法
        self._init_congestion_control()

    def _init_congestion_control(self):
        """初始化拥塞控制算法"""
        self.cc_algorithms = {
            "reno": RenoAlgorithm(),
            "cubic": CubicAlgorithm(),
            "bbr": BBRAlgorithm(),
        }

    def set_congestion_control(self, algorithm: str):
        """设置拥塞控制算法"""
        if algorithm in self.cc_algorithms:
            self.congestion_control = algorithm

    def get_congestion_state(self, connection_key: str) -> Dict[str, Any]:
        """获取拥塞控制状态"""
        cc = self.cc_algorithms.get(self.congestion_control)
        if not cc:
            return {}
        return {
            "algorithm": self.congestion_control,
            "cwnd": cc.cwnd,
            "ssthresh": cc.ssthresh,
            "window_size": cc.get_window_size(),
        }
    
    def create_packet(self, data: Dict[str, Any]) -> Packet:
        """创建 TCP 数据包"""
        packet = Packet(
            protocol=ProtocolType.TCP,
            data={
                "src_port": data.get("src_port", 0),
                "dst_port": data.get("dst_port", 0),
                "seq": data.get("seq", 0),
                "ack": data.get("ack", 0),
                "flags": data.get("flags", TCPFlags.ACK),
                "window_size": data.get("window_size", 65535),
                "payload": data.get("payload", b""),
            },
            source=data.get("source", ""),
            destination=data.get("destination", ""),
        )
        self.packets.append(packet)
        return packet
    
    def three_way_handshake(self, client: str, server: str) -> List[Packet]:
        """
        TCP 三次握手
        
        1. Client -> SYN -> Server
        2. Client <- SYN-ACK <- Server
        3. Client -> ACK -> Server
        """
        packets = []
        conn_key = f"{client}-{server}"
        
        # 1. SYN
        syn = self.create_packet({
            "src_port": 12345,
            "dst_port": 80,
            "seq": 0,
            "flags": TCPFlags.SYN,
            "window_size": 65535,
            "source": client,
            "destination": server,
        })
        packets.append(syn)
        self.states[f"{client}-{server}"] = TCPState.SYN_SENT
        
        # 2. SYN-ACK
        syn_ack = self.create_packet({
            "src_port": 80,
            "dst_port": 12345,
            "seq": 0,
            "ack": 1,
            "flags": TCPFlags.SYN | TCPFlags.ACK,
            "window_size": 65535,
            "source": server,
            "destination": client,
        })
        packets.append(syn_ack)
        self.states[f"{server}-{client}"] = TCPState.SYN_RECEIVED
        
        # 3. ACK
        ack = self.create_packet({
            "src_port": 12345,
            "dst_port": 80,
            "seq": 1,
            "ack": 1,
            "flags": TCPFlags.ACK,
            "window_size": 65535,
            "source": client,
            "destination": server,
        })
        packets.append(ack)
        self.states[conn_key] = TCPState.ESTABLISHED
        
        return packets
    
    def sliding_window_send(self, data: bytes, window_size: int = 3) -> List[Packet]:
        """
        滑动窗口发送
        
        模拟批量发送数据包，窗口大小控制同时发送的包数量
        """
        packets = []
        seq = 0
        chunk_size = 1024  # 每块 1KB
        
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i + chunk_size]
            packet = self.create_packet({
                "seq": seq,
                "payload": chunk,
                "window_size": window_size,
                "flags": TCPFlags.PSH | TCPFlags.ACK,
            })
            packets.append(packet)
            seq += len(chunk)
        
        return packets
    
    def fast_retransmit(self, lost_packet: Packet, dup_acks: int) -> List[Packet]:
        """
        快速重传

        当收到 3 个重复 ACK 时，触发快速重传丢失的数据包
        """
        if dup_acks >= 3:
            # 触发拥塞控制
            cc = self.cc_algorithms.get(self.congestion_control)
            if cc:
                cc.on_ack_received(dup_acks)

            retransmit = self.create_packet({
                "seq": lost_packet.data["seq"],
                "payload": lost_packet.data["payload"],
                "flags": TCPFlags.ACK,
            })
            return [retransmit]
        return []

    def congestion_control_send(self, data: bytes, connection_key: str) -> List[Packet]:
        """
        拥塞控制发送

        根据拥塞窗口大小控制发送的数据包数量
        """
        cc = self.cc_algorithms.get(self.congestion_control)
        if not cc:
            return self.sliding_window_send(data)

        packets = []
        window_size = cc.get_window_size()
        chunk_size = 1024  # 每块 1KB

        # 根据拥塞窗口限制发送数量
        max_packets = max(1, window_size)

        seq = 0
        packet_count = 0
        for i in range(0, min(len(data), max_packets * chunk_size), chunk_size):
            chunk = data[i:i + chunk_size]
            packet = self.create_packet({
                "seq": seq,
                "payload": chunk,
                "window_size": window_size,
                "flags": TCPFlags.PSH | TCPFlags.ACK,
            })
            packets.append(packet)
            seq += len(chunk)
            packet_count += 1

        # 模拟 ACK 接收，更新拥塞窗口
        for _ in range(packet_count):
            if cc:
                cc.on_ack_received()

        return packets

    def simulate_packet_loss(self, packet: Packet, loss_rate: float = 0.1) -> Dict[str, Any]:
        """
        模拟丢包

        根据丢包率判断是否丢包
        """
        import random
        is_lost = random.random() < loss_rate

        result = {
            "packet_id": packet.id,
            "is_lost": is_lost,
            "action": None,
        }

        if is_lost:
            result["action"] = "retransmit"
            # 触发拥塞控制
            cc = self.cc_algorithms.get(self.congestion_control)
            if cc:
                cc.on_packet_loss()
                result["congestion_state"] = {
                    "cwnd": cc.cwnd,
                    "ssthresh": cc.ssthresh,
                }

        return result

    def four_way_handshake(self, client: str, server: str) -> List[Packet]:
        """
        TCP 四次挥手（连接关闭）

        1. Client -> FIN -> Server
        2. Client <- ACK <- Server
        3. Client <- FIN <- Server
        4. Client -> ACK -> Server
        """
        packets = []

        # 1. FIN (Client -> Server)
        fin1 = self.create_packet({
            "src_port": 12345,
            "dst_port": 80,
            "seq": 0,
            "flags": TCPFlags.FIN,
            "source": client,
            "destination": server,
        })
        packets.append(fin1)

        # 2. ACK (Server -> Client)
        ack1 = self.create_packet({
            "src_port": 80,
            "dst_port": 12345,
            "seq": 0,
            "ack": 1,
            "flags": TCPFlags.ACK,
            "source": server,
            "destination": client,
        })
        packets.append(ack1)

        # 3. FIN (Server -> Client)
        fin2 = self.create_packet({
            "src_port": 80,
            "dst_port": 12345,
            "seq": 0,
            "flags": TCPFlags.FIN,
            "source": server,
            "destination": client,
        })
        packets.append(fin2)

        # 4. ACK (Client -> Server)
        ack2 = self.create_packet({
            "src_port": 12345,
            "dst_port": 80,
            "seq": 1,
            "ack": 1,
            "flags": TCPFlags.ACK,
            "source": client,
            "destination": server,
        })
        packets.append(ack2)

        return packets
    
    def process_packet(self, packet: Packet) -> Dict[str, Any]:
        """处理 TCP 数据包"""
        flags = packet.data.get("flags", 0)
        
        result = {
            "accepted": True,
            "response_flags": 0,
            "state_change": None,
        }
        
        if flags & TCPFlags.SYN and not (flags & TCPFlags.ACK):
            # SYN 包，请求建立连接
            result["response_flags"] = TCPFlags.SYN | TCPFlags.ACK
            result["ack"] = packet.data["seq"] + 1
            
        elif flags & TCPFlags.SYN and flags & TCPFlags.ACK:
            # SYN-ACK 包
            result["response_flags"] = TCPFlags.ACK
            result["ack"] = packet.data["seq"] + 1
            
        elif flags & TCPFlags.FIN:
            # FIN 包，请求关闭连接
            result["response_flags"] = TCPFlags.FIN | TCPFlags.ACK
            result["ack"] = packet.data["seq"] + 1
            result["state_change"] = "CLOSE_WAIT"
        
        return result
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据（传输层）"""
        return [
            {
                "layer": 4,
                "name": "Transport Layer",
                "protocol": "TCP",
                "fields": {
                    "Source Port": packet.data.get("src_port", 0),
                    "Destination Port": packet.data.get("dst_port", 0),
                    "Sequence Number": packet.data.get("seq", 0),
                    "Acknowledgment Number": packet.data.get("ack", 0),
                    "Flags": self._parse_flags(packet.data.get("flags", 0)),
                    "Window Size": packet.data.get("window_size", 65535),
                },
                "hex": self._to_hex(packet.data),
            }
        ]
    
    def _parse_flags(self, flags: int) -> str:
        """解析 TCP 标志位"""
        flag_names = []
        if flags & TCPFlags.SYN: flag_names.append("SYN")
        if flags & TCPFlags.ACK: flag_names.append("ACK")
        if flags & TCPFlags.FIN: flag_names.append("FIN")
        if flags & TCPFlags.RST: flag_names.append("RST")
        if flags & TCPFlags.PSH: flag_names.append("PSH")
        if flags & TCPFlags.URG: flag_names.append("URG")
        return ", ".join(flag_names) if flag_names else "None"
    
    def _to_hex(self, data: Dict) -> str:
        """转换为十六进制字符串（简化版）"""
        return "54 43 50 ..."
