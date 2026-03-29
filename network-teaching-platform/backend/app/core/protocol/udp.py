"""
UDP 协议模拟
实现无连接传输、广播、IP 分片等功能
"""
from typing import Dict, Any, List
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
import uuid


class UDPProtocol(BaseProtocol):
    """UDP 协议模拟器"""
    
    def __init__(self):
        super().__init__()
        self.mtu = 1500  # 最大传输单元
    
    def create_packet(self, data: Dict[str, Any]) -> Packet:
        """创建 UDP 数据包"""
        packet = Packet(
            protocol=ProtocolType.UDP,
            data={
                "src_port": data.get("src_port", 0),
                "dst_port": data.get("dst_port", 0),
                "length": data.get("length", 8),
                "checksum": data.get("checksum", 0),
                "payload": data.get("payload", b""),
            },
            source=data.get("source", ""),
            destination=data.get("destination", ""),
        )
        self.packets.append(packet)
        return packet
    
    def send(self, data: bytes, destination: str) -> List[Packet]:
        """
        发送 UDP 数据（无连接）
        
        UDP 不需要握手，直接发送数据
        """
        packet = self.create_packet({
            "length": len(data) + 8,  # UDP 头部 8 字节
            "payload": data,
            "destination": destination,
        })
        return [packet]
    
    def broadcast(self, data: bytes, destinations: List[str]) -> List[Packet]:
        """
        UDP 广播
        
        同时向多个目标发送相同数据
        """
        packets = []
        for dest in destinations:
            packet = self.create_packet({
                "length": len(data) + 8,
                "payload": data,
                "destination": dest,
            })
            packets.append(packet)
        return packets
    
    def fragment(self, data: bytes) -> List[Dict[str, Any]]:
        """
        IP 分片
        
        当数据包大于 MTU 时，拆分为多个分片
        每个分片带偏移量和 MF（More Fragments）标志
        """
        fragments = []
        offset = 0
        fragment_id = str(uuid.uuid4())
        
        while offset < len(data):
            chunk = data[offset:offset + self.mtu]
            is_more = offset + len(chunk) < len(data)
            
            fragment = {
                "id": fragment_id,
                "offset": offset // 8,  # 分片偏移量（以 8 字节为单位）
                "mf": is_more,  # More Fragments 标志
                "df": False,  # Don't Fragment 标志
                "payload": chunk.hex(),
                "payload_size": len(chunk),
            }
            fragments.append(fragment)
            offset += len(chunk)
        
        return fragments
    
    def reassemble(self, fragments: List[Dict[str, Any]]) -> bytes:
        """
        重组分片
        
        按偏移量排序并重组为完整数据
        """
        if not fragments:
            return b""
        
        # 按偏移量排序
        sorted_fragments = sorted(fragments, key=lambda x: x["offset"])
        
        # 检查是否完整（最后一个分片的 MF 应为 0）
        if sorted_fragments[-1].get("mf", False):
            raise ValueError("数据不完整，无法重组")
        
        # 重组数据
        data = b""
        for frag in sorted_fragments:
            payload = frag.get("payload", "")
            if isinstance(payload, str):
                data += bytes.fromhex(payload)
            else:
                data += payload
        
        return data
    
    def process_packet(self, packet: Packet) -> Dict[str, Any]:
        """处理 UDP 数据包"""
        return {
            "accepted": True,
            "delivered": True,  # UDP 无确认，直接交付
        }
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据（传输层）"""
        return [
            {
                "layer": 4,
                "name": "Transport Layer",
                "protocol": "UDP",
                "fields": {
                    "Source Port": packet.data.get("src_port", 0),
                    "Destination Port": packet.data.get("dst_port", 0),
                    "Length": packet.data.get("length", 0),
                    "Checksum": hex(packet.data.get("checksum", 0)),
                },
                "hex": self._to_hex(packet.data),
            }
        ]
    
    def _to_hex(self, data: Dict) -> str:
        """转换为十六进制字符串（简化版）"""
        return "55 44 50 ..."
