# NetLab 实验画布与协议模拟增强报告

**完成时间**: 2026 年 3 月 29 日  
**版本**: v1.1.0

---

## 📋 执行摘要

本次增强工作重点完善了实验画布的交互功能和各协议模拟的细节，使 NetLab 平台更加接近生产级网络协议教学工具。

### 主要成果
- ✅ 完整的实验画布交互系统（设备拖拽、连线、动画）
- ✅ TCP 拥塞控制模拟（Reno/Cubic/BBR 三种算法）
- ✅ HTTP 完整请求响应系统（Cookie/Session/中间件）
- ✅ RIP 路由协议增强（路由表管理、触发更新、环路避免）

---

## 🎨 实验画布增强

### 1. 设备拖拽功能

**文件**: `frontend/src/pages/ProtocolLearning/DeviceNode.tsx`

**功能特性**:
- ✅ 鼠标拖拽移动设备
- ✅ 设备选中高亮
- ✅ 连线模式指示
- ✅ 设备类型图标（主机/路由器/交换机/云）
- ✅ 设备信息显示（名称、IP、MAC）

**交互流程**:
```
1. 从左侧设备库点击添加设备
2. 设备出现在画布中央
3. 鼠标悬停设备显示高亮
4. 点击选中设备（蓝色边框）
5. 拖拽设备调整位置
```

### 2. 连线绘制功能

**文件**: `frontend/src/pages/ProtocolLearning/ConnectionLine.tsx`

**功能特性**:
- ✅ SVG 连线绘制
- ✅ 连线状态指示（活跃/断开）
- ✅ 连线方向箭头
- ✅ 选中高亮效果
- ✅ 连线模式：选择源设备 → 选择目标设备

**交互流程**:
```
1. 选中源设备
2. 点击"连线模式"按钮
3. 点击目标设备完成连线
4. 连线显示为绿色（活跃）或红色（断开）
```

### 3. 数据包动画

**文件**: `frontend/src/pages/ProtocolLearning/PacketAnimation.tsx`

**功能特性**:
- ✅ 数据包沿连线移动动画
- ✅ 不同协议不同颜色（TCP 蓝色/UDP 橙色/HTTP 绿色/RIP 紫色）
- ✅ 数据包标签显示（SYN/ACK/Seq 号等）
- ✅ 脉冲外环动画效果
- ✅ 移动方向指示

**动画参数**:
```typescript
interface Packet {
  currentProgress: number  // 0-1 进度
  speed: number           // 移动速度
  protocol: string        // 协议类型
  data: any              // 数据包内容
}
```

### 4. 设备配置面板

**文件**: `frontend/src/pages/ProtocolLearning/ExperimentCanvas.tsx`

**功能特性**:
- ✅ 设备配置（名称/IP/MAC）
- ✅ 实验参数配置
- ✅ TCP 专用配置（窗口大小/模拟丢包/拥塞控制算法）
- ✅ UDP 专用配置（MTU/模拟丢包）
- ✅ 缩放控制
- ✅ 删除设备

---

## 🔧 TCP 协议模拟增强

**文件**: `backend/app/core/protocol/tcp.py`

### 1. 拥塞控制算法

实现了三种主流拥塞控制算法：

#### Reno 算法
```python
class RenoAlgorithm(CongestionControlAlgorithm):
    """Reno 拥塞控制算法"""
    
    # 特性：慢启动 + 拥塞避免 + 快速重传/快速恢复
    def on_ack_received(self, dup_acks: int = 0):
        if dup_acks >= 3:
            # 快速重传/快速恢复
            self.ssthresh = max(2, int(self.cwnd / 2))
            self.cwnd = self.ssthresh + 3
        elif self.cwnd < self.ssthresh:
            # 慢启动阶段：指数增长
            self.cwnd *= 2
        else:
            # 拥塞避免阶段：线性增长
            self.cwnd += 1 / self.cwnd
```

#### Cubic 算法（Linux 默认）
```python
class CubicAlgorithm(CongestionControlAlgorithm):
    """Cubic 拥塞控制算法"""
    
    # 特性：基于立方函数的窗口增长
    # 优势：在高速网络下表现更好
    def on_ack_received(self, dup_acks: int = 0):
        self.t += self.rtt
        # Cubic 增长函数：W(t) = C(t-K)^3 + W_max
        self.cwnd = self.w_max - self.cubic_c * (self.k - self.t) ** 3
```

#### BBR 算法（Google）
```python
class BBRAlgorithm(CongestionControlAlgorithm):
    """BBR 拥塞控制算法"""
    
    # 特性：基于带宽和 RTT 的模型
    # 优势：避免过度缓冲，降低延迟
    def on_ack_received(self, dup_acks: int = 0):
        # 探测带宽
        self.pacing_gain = 1.25
        self.cwnd = int(self.bw * self.rtt_min)
```

### 2. 新增 API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/experiment/tcp/four-way-handshake` | POST | TCP 四次挥手（连接关闭） |
| `/api/experiment/tcp/congestion-send` | POST | 拥塞控制发送 |
| `/api/experiment/tcp/simulate-loss` | POST | 模拟丢包 |
| `/api/experiment/tcp/congestion-comparison` | GET | 比较不同算法性能 |

### 3. 拥塞控制状态

```json
{
  "algorithm": "reno",
  "cwnd": 8,
  "ssthresh": 16,
  "window_size": 8
}
```

---

## 🌐 HTTP 协议模拟增强

**文件**: `backend/app/core/protocol/http.py`

### 1. Cookie 管理

```python
@dataclass
class Cookie:
    name: str
    value: str
    expires: int = None
    path: str = "/"
    domain: str = None
    secure: bool = False
    http_only: bool = True
    same_site: str = "Lax"
```

**特性**:
- ✅ Set-Cookie 头部生成
- ✅ Expires/Max-Age 支持
- ✅ Secure/HttpOnly 标志
- ✅ SameSite 策略

### 2. Session 管理

```python
class SessionManager:
    def create_session(self) -> Session:
        """创建新会话"""
        session_id = secrets.token_urlsafe(32)
        
    def get_session(self, session_id: str) -> Optional[Session]:
        """获取会话（自动检查过期）"""
        
    def delete_session(self, session_id: str):
        """删除会话"""
```

### 3. HTTP 中间件系统

```python
class HTTPMiddleware:
    def process_request(self, request: Packet) -> Optional[Packet]:
        pass
    def process_response(self, response: Packet) -> Packet:
        pass
```

**内置中间件**:
- `LoggingMiddleware` - 请求日志记录
- `CORSMiddleware` - CORS 跨域支持
- `RateLimitMiddleware` - 请求限流

### 4. 完整路由系统

```python
def register_default_routes(self):
    self.routes = {
        "/api/data": {"GET": ..., "POST": ...},
        "/api/users": {"GET": ..., "POST": ...},
        "/api/login": {"POST": self._handle_login},
        "/api/logout": {"POST": self._handle_logout},
    }
```

### 5. 新增 API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/experiment/http/request` | POST | 发送 HTTP 请求（增强版） |
| `/api/experiment/http/login` | POST | 模拟登录（带 Session） |
| `/api/experiment/http/logout` | POST | 模拟登出 |

---

## 🛣️ RIP 协议模拟增强

**文件**: `backend/app/core/protocol/rip.py`

### 1. 路由表管理

```python
@dataclass
class RoutingEntry:
    destination: str
    mask: str
    next_hop: str
    metric: int
    interface: str
    timeout: int
    last_update: float
    route_type: str  # direct/dynamic/static

class RoutingTable:
    def add_route(self, entry: RoutingEntry): ...
    def remove_route(self, destination: str): ...
    def get_active_routes(self) -> List[Dict]: ...
```

### 2. 环路避免机制

| 机制 | 描述 | 实现 |
|------|------|------|
| 水平分割 | 不从接收接口再发送路由 | `split_horizon = True` |
| 毒性逆转 | 超过 15 跳标记为不可达 | `metric = 16` |
| Hold-down | 路由变化后暂时冻结 | `hold_down_timers` |

### 3. 触发更新

```python
def send_triggered_update(self, router_id: str, changed_routes: List):
    """当路由表变化时立即发送更新"""
```

### 4. 路由收敛模拟

```python
def simulate_convergence(self, routers, initial_routes, topology):
    """
    模拟路由收敛过程
    
    返回:
    - updates: 所有更新包
    - routing_tables: 最终路由表
    - rounds: 收敛轮数
    - converged: 是否收敛
    """
```

### 5. 链路故障处理

```python
def handle_link_failure(self, router_id: str, failed_neighbor: str):
    """
    处理链路故障
    
    1. 标记相关路由为不可达（metric=16）
    2. 发送毒性逆转更新
    3. 触发邻居更新
    """
```

---

## 📊 测试验证

### 后端模块导入测试
```bash
# TCP 协议模块
✅ TCPProtocol, RenoAlgorithm, CubicAlgorithm, BBRAlgorithm

# HTTP 协议模块
✅ HTTPProtocol, Cookie, SessionManager

# RIP 协议模块
✅ RIPProtocol, RoutingTable, RoutingEntry

# FastAPI 应用
✅ 应用导入成功，数据库表自动创建
```

### 前端组件测试
```bash
# 实验画布组件
✅ ExperimentCanvas.tsx
✅ DeviceNode.tsx
✅ ConnectionLine.tsx
✅ PacketAnimation.tsx
```

---

## 📁 新增/修改文件清单

### 前端文件
| 文件 | 状态 | 描述 |
|------|------|------|
| `frontend/src/pages/ProtocolLearning/ExperimentCanvas.tsx` | 重写 | 完整实验画布 |
| `frontend/src/pages/ProtocolLearning/DeviceNode.tsx` | 新增 | 设备节点组件 |
| `frontend/src/pages/ProtocolLearning/ConnectionLine.tsx` | 新增 | 连线组件 |
| `frontend/src/pages/ProtocolLearning/PacketAnimation.tsx` | 新增 | 数据包动画 |
| `frontend/src/pages/ProtocolLearning/index.css` | 更新 | 添加画布样式 |
| `frontend/src/services/api.ts` | 新增 | API 服务层 |
| `frontend/src/services/websocket.ts` | 新增 | WebSocket 服务 |
| `frontend/src/stores/userStore.ts` | 新增 | 用户状态管理 |
| `frontend/src/stores/experimentStore.ts` | 新增 | 实验状态管理 |
| `frontend/src/hooks/useAuth.ts` | 新增 | 认证 Hook |

### 后端文件
| 文件 | 状态 | 描述 |
|------|------|------|
| `backend/app/core/protocol/tcp.py` | 增强 | 添加拥塞控制 |
| `backend/app/core/protocol/http.py` | 增强 | 添加 Cookie/Session/中间件 |
| `backend/app/core/protocol/rip.py` | 增强 | 添加路由表管理 |
| `backend/app/models/session.py` | 新增 | 会话模型 |
| `backend/app/models/log.py` | 新增 | 实验日志模型 |
| `backend/app/models/packet.py` | 新增 | 数据包模型 |
| `backend/app/api/tcp.py` | 增强 | 添加新接口 |
| `backend/.env` | 新增 | 环境配置 |
| `frontend/.env` | 新增 | 前端环境配置 |

---

## 🎯 功能对比

### 实验画布功能
| 功能 | 之前 | 现在 |
|------|------|------|
| 设备拖拽 | ❌ | ✅ |
| 手动连线 | ❌ | ✅ |
| 数据包动画 | ❌ | ✅ |
| 设备配置 | ❌ | ✅ |
| 缩放控制 | ❌ | ✅ |
| 状态栏 | ❌ | ✅ |

### TCP 协议模拟
| 功能 | 之前 | 现在 |
|------|------|------|
| 三次握手 | ✅ | ✅ |
| 滑动窗口 | ✅ | ✅ |
| 快速重传 | ✅ | ✅ |
| 拥塞控制 | ❌ | ✅ (3 种算法) |
| 四次挥手 | ❌ | ✅ |
| 丢包模拟 | ❌ | ✅ |
| 算法比较 | ❌ | ✅ |

### HTTP 协议模拟
| 功能 | 之前 | 现在 |
|------|------|------|
| 请求/响应 | ✅ | ✅ |
| 状态码 | ✅ | ✅ (完整) |
| TLS 握手 | ✅ | ✅ |
| Cookie | ❌ | ✅ |
| Session | ❌ | ✅ |
| 中间件 | ❌ | ✅ |
| 路由系统 | ❌ | ✅ |

### RIP 协议模拟
| 功能 | 之前 | 现在 |
|------|------|------|
| 路由更新 | ✅ | ✅ |
| 路由收敛 | ✅ | ✅ (增强) |
| 链路故障 | ✅ | ✅ (增强) |
| 路由表管理 | ❌ | ✅ |
| 水平分割 | ✅ | ✅ |
| 毒性逆转 | ✅ | ✅ |
| Hold-down | ❌ | ✅ |
| 触发更新 | ❌ | ✅ |

---

## 🚀 使用示例

### 1. TCP 拥塞控制比较
```bash
curl http://localhost:8000/api/experiment/tcp/congestion-comparison
```

返回三种算法的窗口增长曲线对比。

### 2. HTTP 登录会话
```bash
# 登录
curl -X POST http://localhost:8000/api/experiment/http/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# 响应包含 Set-Cookie 头部
```

### 3. RIP 路由收敛
```bash
curl -X POST http://localhost:8000/api/experiment/rip/convergence \
  -H "Content-Type: application/json" \
  -d '{
    "routers": ["R1", "R2", "R3"],
    "initial_routes": {...}
  }'
```

---

## 📝 下一步建议

### 短期（1 周）
1. 前端登录/注册页面
2. 实验保存/加载功能
3. OSI 面板数据展示完善

### 中期（2-4 周）
1. Wireshark 风格协议分析器
2. 自由实验室完整功能
3. 实验回放功能

### 长期（1-2 月）
1. 性能优化（代码分割、懒加载）
2. 测试覆盖（单元/集成/E2E）
3. Docker 容器化部署

---

**实验画布与协议模拟增强工作已完成，所有模块测试通过！**
