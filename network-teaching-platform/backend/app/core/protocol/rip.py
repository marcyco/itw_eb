"""
RIP 路由协议模拟
实现距离矢量算法、路由收敛、环路避免等功能
"""
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import time
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
import uuid


class RIPCommand(Enum):
    """RIP 命令"""
    REQUEST = 1
    RESPONSE = 2


class RIPVersion(Enum):
    """RIP 版本"""
    RIPv1 = 1
    RIPv2 = 2


@dataclass
class RoutingEntry:
    """路由表项"""
    destination: str
    mask: str
    next_hop: str
    metric: int
    interface: str = "eth0"
    timeout: int = 180  # 超时时间（秒）
    last_update: float = field(default_factory=time.time)
    route_type: str = "dynamic"  # direct, dynamic, static

    def is_expired(self) -> bool:
        """检查路由是否过期"""
        return time.time() - self.last_update > self.timeout

    def is_invalid(self) -> bool:
        """检查路由是否无效（metric >= 16）"""
        return self.metric >= 16

    def to_dict(self) -> Dict[str, Any]:
        return {
            "destination": self.destination,
            "mask": self.mask,
            "next_hop": self.next_hop,
            "metric": self.metric,
            "interface": self.interface,
            "route_type": self.route_type,
            "timeout": self.timeout - (time.time() - self.last_update),
        }


class RoutingTable:
    """路由表"""

    def __init__(self, router_id: str):
        self.router_id = router_id
        self.entries: Dict[str, RoutingEntry] = {}
        self.neighbors: Dict[str, float] = {}  # neighbor_id -> last_update_time

    def add_route(self, entry: RoutingEntry):
        """添加或更新路由"""
        dest = entry.destination
        if dest not in self.entries or entry.metric < self.entries[dest].metric:
            self.entries[dest] = entry

    def remove_route(self, destination: str):
        """删除路由"""
        if destination in self.entries:
            del self.entries[destination]

    def get_route(self, destination: str) -> Optional[RoutingEntry]:
        """获取路由"""
        return self.entries.get(destination)

    def get_all_routes(self) -> List[Dict[str, Any]]:
        """获取所有路由"""
        return [entry.to_dict() for entry in self.entries.values()]

    def get_active_routes(self) -> List[Dict[str, Any]]:
        """获取活跃路由（未过期且有效）"""
        return [
            entry.to_dict() for entry in self.entries.values()
            if not entry.is_expired() and not entry.is_invalid()
        ]

    def update_neighbor(self, neighbor_id: str):
        """更新邻居活动时间"""
        self.neighbors[neighbor_id] = time.time()

    def get_inactive_neighbors(self, timeout: int = 180) -> List[str]:
        """获取不活跃的邻居"""
        current_time = time.time()
        return [
            neighbor for neighbor, last_update in self.neighbors.items()
            if current_time - last_update > timeout
        ]


class RIPProtocol(BaseProtocol):
    """RIP 协议模拟器"""

    def __init__(self):
        super().__init__()
        self.port = 520
        self.max_hop = 15
        self.invalid_metric = 16
        self.update_interval = 30  # 秒
        self.timeout_interval = 180  # 秒
        self.garbage_collection_time = 120  # 秒

        self.routing_tables: Dict[str, RoutingTable] = {}
        self.topology: Dict[str, List[str]] = {}  # router_id -> [neighbor_ids]

        # 环路避免机制
        self.split_horizon = True
        self.poison_reverse = True
        self.hold_down = True
        self.hold_down_timers: Dict[str, Dict[str, float]] = {}  # router_id -> {destination: hold_down_end_time}

    def initialize_router(self, router_id: str, interfaces: List[Dict[str, str]]):
        """
        初始化路由器

        interfaces: [{"ip": "192.168.1.1", "mask": "255.255.255.0", "interface": "eth0"}]
        """
        if router_id not in self.routing_tables:
            self.routing_tables[router_id] = RoutingTable(router_id)

        table = self.routing_tables[router_id]

        # 添加直连路由
        for iface in interfaces:
            entry = RoutingEntry(
                destination=self._get_network_address(iface["ip"], iface["mask"]),
                mask=iface["mask"],
                next_hop="direct",
                metric=1,
                interface=iface["interface"],
                route_type="direct",
            )
            table.add_route(entry)

    def _get_network_address(self, ip: str, mask: str) -> str:
        """计算网络地址"""
        ip_parts = [int(x) for x in ip.split(".")]
        mask_parts = [int(x) for x in mask.split(".")]
        network_parts = [ip_parts[i] & mask_parts[i] for i in range(4)]
        return ".".join(map(str, network_parts))
    
    def create_update_packet(self, router_id: str, routes: List[Dict[str, Any]]) -> Packet:
        """
        创建 RIP 更新包
        
        Command: 1=Request, 2=Response
        Version: 1=RIPv1, 2=RIPv2
        """
        packet = Packet(
            protocol=ProtocolType.RIP,
            data={
                "command": 2,  # Response
                "version": 2,
                "routes": [
                    {
                        "ip": r.get("ip", "0.0.0.0"),
                        "mask": r.get("mask", "255.255.255.0"),
                        "next_hop": r.get("next_hop", "0.0.0.0"),
                        "metric": min(r.get("metric", 1), 16),
                    }
                    for r in routes
                ],
            },
            source=router_id,
            destination="224.0.0.9",  # RIP 组播地址
        )
        self.packets.append(packet)
        return packet
    
    def update_routing_table(self, router_id: str, received_routes: List[Dict[str, Any]], neighbor: str):
        """
        更新路由表（距离矢量算法）

        收到邻居的路由更新后，更新本地路由表
        """
        if router_id not in self.routing_tables:
            self.routing_tables[router_id] = RoutingTable(router_id)

        table = self.routing_tables[router_id]
        table.update_neighbor(neighbor)

        for route in received_routes:
            dest = route.get("ip") or route.get("destination")
            if not dest:
                continue

            metric = route.get("metric", 1) + 1  # 经过邻居，跳数 +1
            mask = route.get("mask", "255.255.255.0")

            # 水平分割检查
            if self.split_horizon:
                existing = table.get_route(dest)
                if existing and existing.next_hop == neighbor:
                    continue

            # 毒性逆转：超过最大跳数标记为不可达
            if metric > self.max_hop:
                metric = self.invalid_metric

            # 检查 Hold-down
            if self.hold_down and router_id in self.hold_down_timers:
                if dest in self.hold_down_timers[router_id]:
                    if time.time() < self.hold_down_timers[router_id][dest]:
                        # 在 Hold-down 期间，只接受来自原下一跳的更好路由
                        continue

            # 更新路由表
            existing = table.get_route(dest)
            if existing is None or existing.metric > metric:
                entry = RoutingEntry(
                    destination=dest,
                    mask=mask,
                    next_hop=neighbor,
                    metric=min(metric, self.invalid_metric),
                )
                table.add_route(entry)

                # 如果路由变为不可达，启动 Hold-down 计时器
                if metric >= self.invalid_metric:
                    if router_id not in self.hold_down_timers:
                        self.hold_down_timers[router_id] = {}
                    self.hold_down_timers[router_id][dest] = time.time() + self.garbage_collection_time

    def send_triggered_update(self, router_id: str, changed_routes: List[Dict[str, Any]]) -> List[Packet]:
        """
        发送触发更新

        当路由表发生变化时，立即发送更新（而不是等待定期更新）
        """
        packets = []

        # 创建触发更新包
        packet = self.create_update_packet(router_id, changed_routes)
        packet.data["triggered"] = True  # 标记为触发更新
        packets.append(packet)

        # 发送给所有邻居
        if router_id in self.topology:
            for neighbor_id in self.topology[router_id]:
                # 应用水平分割
                if self.split_horizon:
                    filtered_routes = [
                        r for r in changed_routes
                        if not (r.get("next_hop") == neighbor_id)
                    ]
                    if filtered_routes:
                        packets.append(self.create_update_packet(router_id, filtered_routes))
                else:
                    packets.append(self.create_update_packet(router_id, changed_routes))

        return packets

    def simulate_convergence(self, routers: List[str], initial_routes: Dict[str, List[Dict]], topology: Dict[str, List[str]] = None) -> Dict[str, Any]:
        """
        模拟路由收敛

        路由器之间交换路由信息，直到所有路由表收敛
        """
        self.topology = topology or {r: [x for x in routers if x != r] for r in routers}
        updates = []
        rounds = 0

        # 初始化路由表（直连路由）
        for router_id, routes in initial_routes.items():
            self.initialize_router(router_id, [
                {"ip": r.get("ip"), "mask": r.get("mask", "255.255.255.0"), "interface": "eth0"}
                for r in routes
            ])

        # 模拟多轮更新传播
        converged = False
        while not converged and rounds < len(routers) * 2:
            rounds += 1
            changes_this_round = 0

            for router_id in routers:
                table = self.routing_tables.get(router_id)
                if not table:
                    continue

                # 获取当前路由表
                routes = table.get_active_routes()

                # 发送给所有邻居
                for neighbor_id in self.topology.get(router_id, []):
                    # 应用水平分割
                    if self.split_horizon:
                        filtered_routes = [
                            r for r in routes
                            if r.get("next_hop") != neighbor_id
                        ]
                    else:
                        filtered_routes = routes

                    if filtered_routes:
                        packet = self.create_update_packet(router_id, filtered_routes)
                        updates.append(packet)

                        # 更新邻居路由表
                        self.update_routing_table(neighbor_id, filtered_routes, router_id)
                        changes_this_round += 1

            # 如果没有变化，说明已收敛
            converged = changes_this_round == 0

        # 返回所有路由器的最终路由表
        routing_tables = {
            router_id: table.get_all_routes()
            for router_id, table in self.routing_tables.items()
        }

        return {
            "updates": updates,
            "routing_tables": routing_tables,
            "rounds": rounds,
            "converged": converged,
        }
    
    def handle_link_failure(self, router_id: str, failed_neighbor: str) -> Packet:
        """
        处理链路故障
        
        当邻居路由器不可达时，标记相关路由为不可达（metric=16）
        并发送毒性逆转更新
        """
        table = self.routing_tables.get(router_id, {})
        unreachable_routes = []
        
        # 标记通过该邻居的路由为不可达
        for dest, info in table.items():
            if info["next_hop"] == failed_neighbor:
                info["metric"] = 16
                unreachable_routes.append({
                    "ip": dest,
                    "mask": info.get("mask", "255.255.255.0"),
                    "metric": 16,
                })
        
        # 发送毒性逆转更新
        return self.create_update_packet(router_id, unreachable_routes)
    
    def process_packet(self, packet: Packet) -> Dict[str, Any]:
        """处理 RIP 数据包"""
        routes = packet.data.get("routes", [])
        source = packet.source
        
        # 更新路由表
        result = {"updated_routes": []}
        for route in routes:
            dest = route["ip"]
            metric = route.get("metric", 1)
            
            # 这里应该调用 update_routing_table，但需要知道接收接口
            result["updated_routes"].append({
                "destination": dest,
                "metric": metric,
                "from": source,
            })
        
        return result
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据"""
        return [
            {
                "layer": 5,
                "name": "Session Layer",
                "protocol": "RIP",
                "fields": {
                    "Command": packet.data.get("command", 2),
                    "Version": packet.data.get("version", 2),
                    "Routes": packet.data.get("routes", []),
                },
            },
            {
                "layer": 4,
                "name": "Transport Layer",
                "protocol": "UDP",
                "fields": {
                    "Source Port": 520,
                    "Destination Port": 520,
                },
            }
        ]
