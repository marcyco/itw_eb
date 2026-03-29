# NetLab API 接口文档

## 📋 接口概览

| 模块 | 前缀 | 描述 |
|------|------|------|
| 认证 | `/api/auth` | 用户注册、登录、认证 |
| 用户 | `/api/users` | 用户信息管理 |
| 实验 | `/api/experiment` | 实验管理 |
| 拓扑 | `/api/topology` | 拓扑管理 |
| TCP | `/api/experiment/tcp` | TCP 协议实验 |
| UDP | `/api/experiment/udp` | UDP 协议实验 |
| HTTP | `/api/experiment/http` | HTTP 协议实验 |
| RIP | `/api/experiment/rip` | RIP 协议实验 |
| FTP | `/api/experiment/ftp` | FTP 协议实验 |
| WebSocket | `/ws` | 实时通信 |

---

## 🔐 认证接口

### 用户注册

**接口**: `POST /api/auth/register`

**请求体**:
```json
{
  "username": "string (required, 3-50 字符)",
  "email": "string (required, 邮箱格式)",
  "password": "string (required, 最少 6 字符)"
}
```

**响应**:
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "is_active": true,
  "created_at": "2026-03-28T10:00:00Z"
}
```

**状态码**:
- `200` - 注册成功
- `400` - 请求参数错误
- `409` - 用户名或邮箱已存在

---

### 用户登录

**接口**: `POST /api/auth/login`

**请求体**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**状态码**:
- `200` - 登录成功
- `401` - 用户名或密码错误

---

### 获取当前用户信息

**接口**: `GET /api/auth/me`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应**:
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "is_active": true,
  "created_at": "2026-03-28T10:00:00Z"
}
```

**状态码**:
- `200` - 成功
- `401` - 未授权

---

## 👤 用户接口

### 获取用户详情

**接口**: `GET /api/users/{user_id}`

**路径参数**:
- `user_id` - 用户 ID

**响应**:
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "is_active": true,
  "created_at": "2026-03-28T10:00:00Z",
  "experiments": [],
  "topologies": []
}
```

---

### 更新用户信息

**接口**: `PUT /api/users/{user_id}`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

**响应**:
```json
{
  "id": 1,
  "username": "newusername",
  "email": "newemail@example.com",
  "is_active": true,
  "created_at": "2026-03-28T10:00:00Z"
}
```

---

## 🧪 实验接口

### 创建实验

**接口**: `POST /api/experiment/create`

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
  "title": "TCP 三次握手实验",
  "description": "学习 TCP 连接建立过程",
  "protocol_type": "tcp",
  "topology_data": {
    "nodes": [],
    "connections": []
  },
  "config": {
    "window_size": 3,
    "simulate_loss": false,
    "congestion_control": "reno"
  }
}
```

**响应**:
```json
{
  "id": 1,
  "title": "TCP 三次握手实验",
  "description": "学习 TCP 连接建立过程",
  "protocol_type": "tcp",
  "topology_data": {...},
  "config": {...},
  "owner_id": 1,
  "created_at": "2026-03-28T10:00:00Z",
  "updated_at": "2026-03-28T10:00:00Z"
}
```

---

### 获取实验详情

**接口**: `GET /api/experiment/{experiment_id}`

**响应**:
```json
{
  "id": 1,
  "title": "TCP 三次握手实验",
  "description": "学习 TCP 连接建立过程",
  "protocol_type": "tcp",
  "topology_data": {
    "nodes": [
      {"id": "node1", "type": "host", "position": {"x": 100, "y": 100}}
    ],
    "connections": []
  },
  "config": {
    "window_size": 3,
    "simulate_loss": false
  },
  "owner_id": 1,
  "created_at": "2026-03-28T10:00:00Z",
  "updated_at": "2026-03-28T10:00:00Z"
}
```

---

### 更新实验

**接口**: `PUT /api/experiment/{experiment_id}`

**请求体**:
```json
{
  "title": "更新后的实验标题",
  "description": "更新后的描述",
  "topology_data": {...},
  "config": {...}
}
```

---

### 删除实验

**接口**: `DELETE /api/experiment/{experiment_id}`

**响应**:
```json
{
  "message": "实验已删除"
}
```

---

### 列出用户的实验

**接口**: `GET /api/experiment/user/{user_id}`

**响应**:
```json
[
  {
    "id": 1,
    "title": "TCP 三次握手实验",
    "protocol_type": "tcp",
    "created_at": "2026-03-28T10:00:00Z"
  },
  {
    "id": 2,
    "title": "UDP 广播实验",
    "protocol_type": "udp",
    "created_at": "2026-03-28T11:00:00Z"
  }
]
```

---

## 🔗 拓扑接口

### 创建拓扑

**接口**: `POST /api/topology/create`

**请求体**:
```json
{
  "name": "基础网络拓扑",
  "description": "包含主机、路由器、交换机的网络",
  "nodes": [
    {
      "id": "host1",
      "type": "host",
      "config": {
        "ip": "192.168.1.10",
        "subnet_mask": "255.255.255.0",
        "gateway": "192.168.1.1"
      },
      "position": {"x": 100, "y": 100}
    },
    {
      "id": "router1",
      "type": "router",
      "config": {
        "interfaces": [
          {"name": "eth0", "ip": "192.168.1.1"},
          {"name": "eth1", "ip": "192.168.2.1"}
        ]
      },
      "position": {"x": 300, "y": 100}
    }
  ],
  "connections": [
    {
      "id": "conn1",
      "source": "host1",
      "destination": "router1",
      "source_port": "eth0",
      "dest_port": "eth0"
    }
  ],
  "owner_id": 1
}
```

**响应**:
```json
{
  "id": 1,
  "name": "基础网络拓扑",
  "description": "包含主机、路由器、交换机的网络",
  "nodes": [...],
  "connections": [...],
  "owner_id": 1,
  "created_at": "2026-03-28T10:00:00Z"
}
```

---

### 获取拓扑详情

**接口**: `GET /api/topology/{topology_id}`

**响应**:
```json
{
  "id": 1,
  "name": "基础网络拓扑",
  "description": "包含主机、路由器、交换机的网络",
  "nodes": [
    {
      "id": "host1",
      "type": "host",
      "config": {
        "ip": "192.168.1.10",
        "subnet_mask": "255.255.255.0",
        "gateway": "192.168.1.1"
      },
      "position": {"x": 100, "y": 100}
    }
  ],
  "connections": [
    {
      "id": "conn1",
      "source": "host1",
      "destination": "router1",
      "source_port": "eth0",
      "dest_port": "eth0",
      "status": "active"
    }
  ],
  "owner_id": 1,
  "created_at": "2026-03-28T10:00:00Z"
}
```

---

### 更新拓扑

**接口**: `PUT /api/topology/{topology_id}`

**请求体**:
```json
{
  "name": "更新后的拓扑名称",
  "nodes": [...],
  "connections": [...]
}
```

---

### 删除拓扑

**接口**: `DELETE /api/topology/{topology_id}`

**响应**:
```json
{
  "message": "拓扑已删除"
}
```

---

## 📡 TCP 协议实验接口

### 三次握手

**接口**: `POST /api/experiment/tcp/handshake`

**请求体**:
```json
{
  "client": "192.168.1.10",
  "server": "192.168.1.1"
}
```

**响应**:
```json
{
  "packets": [
    {
      "id": "uuid-1",
      "protocol": "tcp",
      "data": {
        "src_port": 12345,
        "dst_port": 80,
        "seq": 0,
        "ack": 0,
        "flags": 2,
        "flags_text": "SYN",
        "window_size": 65535
      },
      "source": "192.168.1.10",
      "destination": "192.168.1.1",
      "timestamp": 1679997600
    },
    {
      "id": "uuid-2",
      "protocol": "tcp",
      "data": {
        "src_port": 80,
        "dst_port": 12345,
        "seq": 0,
        "ack": 1,
        "flags": 18,
        "flags_text": "SYN, ACK",
        "window_size": 65535
      },
      "source": "192.168.1.1",
      "destination": "192.168.1.10",
      "timestamp": 1679997601
    },
    {
      "id": "uuid-3",
      "protocol": "tcp",
      "data": {
        "src_port": 12345,
        "dst_port": 80,
        "seq": 1,
        "ack": 1,
        "flags": 16,
        "flags_text": "ACK",
        "window_size": 65535
      },
      "source": "192.168.1.10",
      "destination": "192.168.1.1",
      "timestamp": 1679997602
    }
  ]
}
```

---

### 滑动窗口发送

**接口**: `POST /api/experiment/tcp/send`

**请求体**:
```json
{
  "payload": "要发送的数据内容",
  "window_size": 3,
  "source": "192.168.1.10",
  "destination": "192.168.1.1"
}
```

**响应**:
```json
{
  "packets": [
    {
      "id": "uuid-1",
      "protocol": "tcp",
      "data": {
        "seq": 0,
        "ack": 0,
        "flags": 24,
        "flags_text": "PSH, ACK",
        "window_size": 3,
        "payload": "要发送的数据内容..."
      },
      "source": "192.168.1.10",
      "destination": "192.168.1.1"
    }
  ]
}
```

---

### 快速重传

**接口**: `POST /api/experiment/tcp/retransmit`

**请求体**:
```json
{
  "packet_id": "丢失的数据包 ID",
  "dup_acks": 3
}
```

**响应**:
```json
{
  "packets": [
    {
      "id": "uuid-retransmit",
      "protocol": "tcp",
      "data": {
        "seq": 1024,
        "flags": 16,
        "flags_text": "ACK",
        "retransmit": true
      }
    }
  ]
}
```

---

## 📤 UDP 协议实验接口

### 发送 UDP 数据

**接口**: `POST /api/experiment/udp/send`

**请求体**:
```json
{
  "payload": "要发送的数据",
  "src_port": 12345,
  "dst_port": 80,
  "source": "192.168.1.10",
  "destination": "192.168.1.1"
}
```

**响应**:
```json
{
  "packets": [
    {
      "id": "uuid-1",
      "protocol": "udp",
      "data": {
        "src_port": 12345,
        "dst_port": 80,
        "length": 28,
        "checksum": 54321,
        "payload": "要发送的数据"
      },
      "source": "192.168.1.10",
      "destination": "192.168.1.1"
    }
  ]
}
```

---

### UDP 广播

**接口**: `POST /api/experiment/udp/broadcast`

**请求体**:
```json
{
  "payload": "广播数据",
  "src_port": 12345,
  "dst_port": 5000,
  "source": "192.168.1.10",
  "destinations": ["192.168.1.20", "192.168.1.30"]
}
```

**响应**:
```json
{
  "packets": [
    {
      "id": "uuid-1",
      "protocol": "udp",
      "data": {
        "src_port": 12345,
        "dst_port": 5000,
        "length": 20,
        "payload": "广播数据"
      },
      "source": "192.168.1.10",
      "destination": "192.168.1.20"
    },
    {
      "id": "uuid-2",
      "protocol": "udp",
      "data": {
        "src_port": 12345,
        "dst_port": 5000,
        "length": 20,
        "payload": "广播数据"
      },
      "source": "192.168.1.10",
      "destination": "192.168.1.30"
    }
  ]
}
```

---

### IP 分片

**接口**: `POST /api/experiment/udp/fragment`

**请求体**:
```json
{
  "payload": "超过 MTU 的大数据包...",
  "mtu": 1500
}
```

**响应**:
```json
{
  "fragments": [
    {
      "id": "fragment-uuid-1",
      "offset": 0,
      "mf": true,
      "df": false,
      "payload": "分片 1 数据..."
    },
    {
      "id": "fragment-uuid-2",
      "offset": 185,
      "mf": false,
      "df": false,
      "payload": "分片 2 数据..."
    }
  ]
}
```

---

### 重组分片

**接口**: `POST /api/experiment/udp/reassemble`

**请求体**:
```json
[
  {
    "id": "fragment-uuid-1",
    "offset": 0,
    "mf": true,
    "payload": "分片 1 数据..."
  },
  {
    "id": "fragment-uuid-2",
    "offset": 185,
    "mf": false,
    "payload": "分片 2 数据..."
  }
]
```

**响应**:
```json
{
  "data": "重组后的完整数据"
}
```

---

## 🌐 HTTP 协议实验接口

### 发送 HTTP 请求

**接口**: `POST /api/experiment/http/request`

**请求体**:
```json
{
  "method": "GET",
  "url": "/api/data",
  "headers": {
    "Host": "example.com",
    "User-Agent": "NetLab/1.0",
    "Accept": "application/json"
  },
  "body": null
}
```

**响应**:
```json
{
  "request": {
    "id": "uuid-req",
    "protocol": "http",
    "data": {
      "type": "request",
      "method": "GET",
      "url": "/api/data",
      "headers": {...},
      "body": null,
      "raw": "GET /api/data HTTP/1.1\r\nHost: example.com\r\n..."
    },
    "source": "client",
    "destination": "server"
  },
  "response": {
    "id": "uuid-resp",
    "protocol": "http",
    "data": {
      "type": "response",
      "status": 200,
      "headers": {
        "Content-Type": "application/json",
        "Content-Length": "42"
      },
      "body": {"data": "Hello"},
      "raw": "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n..."
    },
    "source": "server",
    "destination": "client"
  }
}
```

---

### POST 请求

**接口**: `POST /api/experiment/http/request`

**请求体**:
```json
{
  "method": "POST",
  "url": "/api/submit",
  "headers": {
    "Host": "example.com",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "test",
    "value": 123
  }
}
```

**响应**:
```json
{
  "request": {...},
  "response": {
    "data": {
      "type": "response",
      "status": 200,
      "headers": {...},
      "body": {"result": "success"},
      "raw": "HTTP/1.1 200 OK\r\n..."
    }
  }
}
```

---

### 404 响应

**接口**: `POST /api/experiment/http/request`

**请求体**:
```json
{
  "method": "GET",
  "url": "/nonexistent"
}
```

**响应**:
```json
{
  "request": {...},
  "response": {
    "data": {
      "type": "response",
      "status": 404,
      "headers": {"Content-Type": "text/plain"},
      "body": {"error": "Not Found"},
      "raw": "HTTP/1.1 404 Not Found\r\n..."
    }
  }
}
```

---

### TLS 握手

**接口**: `GET /api/experiment/http/tls-handshake`

**响应**:
```json
{
  "steps": [
    {
      "step": 1,
      "name": "ClientHello",
      "description": "客户端发送支持的加密套件"
    },
    {
      "step": 2,
      "name": "ServerHello",
      "description": "服务器选择加密套件"
    },
    {
      "step": 3,
      "name": "Certificate",
      "description": "服务器发送证书"
    },
    {
      "step": 4,
      "name": "ServerKeyExchange",
      "description": "密钥交换"
    },
    {
      "step": 5,
      "name": "ServerHelloDone",
      "description": "服务器握手完成"
    },
    {
      "step": 6,
      "name": "ClientKeyExchange",
      "description": "客户端密钥交换"
    },
    {
      "step": 7,
      "name": "ChangeCipherSpec",
      "description": "切换加密"
    },
    {
      "step": 8,
      "name": "Finished",
      "description": "握手完成"
    }
  ]
}
```

---

## 🛣️ RIP 协议实验接口

### 发送 RIP 更新

**接口**: `POST /api/experiment/rip/update`

**请求体**:
```json
{
  "router_id": "R1",
  "routes": [
    {
      "ip": "192.168.1.0",
      "mask": "255.255.255.0",
      "metric": 1
    },
    {
      "ip": "192.168.2.0",
      "mask": "255.255.255.0",
      "metric": 2
    }
  ]
}
```

**响应**:
```json
{
  "packet": {
    "id": "uuid-rip",
    "protocol": "rip",
    "data": {
      "command": 2,
      "version": 2,
      "routes": [
        {
          "ip": "192.168.1.0",
          "mask": "255.255.255.0",
          "next_hop": "0.0.0.0",
          "metric": 1
        }
      ]
    },
    "source": "R1",
    "destination": "224.0.0.9"
  }
}
```

---

### 模拟路由收敛

**接口**: `POST /api/experiment/rip/convergence`

**请求体**:
```json
{
  "routers": ["R1", "R2", "R3"],
  "initial_routes": {
    "R1": [
      {"ip": "192.168.1.0", "mask": "255.255.255.0", "metric": 1}
    ],
    "R2": [
      {"ip": "192.168.2.0", "mask": "255.255.255.0", "metric": 1}
    ],
    "R3": [
      {"ip": "192.168.3.0", "mask": "255.255.255.0", "metric": 1}
    ]
  }
}
```

**响应**:
```json
{
  "updates": [
    {
      "id": "uuid-update-1",
      "protocol": "rip",
      "data": {...}
    }
  ],
  "routing_tables": {
    "R1": {
      "192.168.1.0": {"next_hop": "direct", "metric": 1},
      "192.168.2.0": {"next_hop": "R2", "metric": 2},
      "192.168.3.0": {"next_hop": "R2", "metric": 3}
    },
    "R2": {...},
    "R3": {...}
  }
}
```

---

### 链路故障

**接口**: `POST /api/experiment/rip/link-failure`

**请求体**:
```json
{
  "router_id": "R2",
  "failed_neighbor": "R1"
}
```

**响应**:
```json
{
  "packet": {
    "id": "uuid-failure",
    "protocol": "rip",
    "data": {
      "command": 2,
      "version": 2,
      "routes": [
        {
          "ip": "192.168.1.0",
          "mask": "255.255.255.0",
          "metric": 16
        }
      ]
    },
    "source": "R2",
    "destination": "224.0.0.9"
  }
}
```

---

## 📁 FTP 协议实验接口

### FTP 登录

**接口**: `POST /api/experiment/ftp/login`

**请求体**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应**:
```json
{
  "packets": [
    {
      "id": "uuid-user",
      "protocol": "ftp",
      "data": {
        "type": "command",
        "command": "USER",
        "argument": "admin",
        "raw": "USER admin"
      },
      "source": "client",
      "destination": "server"
    },
    {
      "id": "uuid-resp1",
      "protocol": "ftp",
      "data": {
        "type": "response",
        "code": 331,
        "message": "Password required",
        "raw": "331 Password required"
      },
      "source": "server",
      "destination": "client"
    },
    {
      "id": "uuid-pass",
      "protocol": "ftp",
      "data": {
        "type": "command",
        "command": "PASS",
        "argument": "password123",
        "raw": "PASS password123"
      },
      "source": "client",
      "destination": "server"
    },
    {
      "id": "uuid-resp2",
      "protocol": "ftp",
      "data": {
        "type": "response",
        "code": 230,
        "message": "Login successful",
        "raw": "230 Login successful"
      },
      "source": "server",
      "destination": "client"
    }
  ]
}
```

---

### 建立数据连接

**接口**: `POST /api/experiment/ftp/data-connection`

**请求体**:
```json
{
  "mode": "passive"
}
```

**响应**:
```json
{
  "steps": [
    {
      "step": 1,
      "action": "PASV command",
      "description": "客户端发送 PASV 命令"
    },
    {
      "step": 2,
      "action": "Server responds",
      "description": "服务器返回被动模式端口"
    },
    {
      "step": 3,
      "action": "Client connects",
      "description": "客户端连接服务器数据端口"
    }
  ]
}
```

---

### 上传文件

**接口**: `POST /api/experiment/ftp/upload`

**请求体**:
```json
{
  "filename": "test.txt",
  "content": "文件内容"
}
```

**响应**:
```json
{
  "packets": [
    {
      "id": "uuid-stor",
      "protocol": "ftp",
      "data": {
        "type": "command",
        "command": "STOR",
        "argument": "test.txt",
        "raw": "STOR test.txt"
      }
    },
    {
      "id": "uuid-data",
      "protocol": "ftp",
      "data": {
        "type": "data",
        "filename": "test.txt",
        "size": 1024,
        "progress": 100
      }
    },
    {
      "id": "uuid-resp",
      "protocol": "ftp",
      "data": {
        "type": "response",
        "code": 226,
        "message": "Transfer complete",
        "raw": "226 Transfer complete"
      }
    }
  ]
}
```

---

### 下载文件

**接口**: `POST /api/experiment/ftp/download`

**请求体**:
```json
{
  "filename": "test.txt"
}
```

**响应**:
```json
{
  "packets": [
    {
      "id": "uuid-retr",
      "protocol": "ftp",
      "data": {
        "type": "command",
        "command": "RETR",
        "argument": "test.txt",
        "raw": "RETR test.txt"
      }
    },
    {
      "id": "uuid-data",
      "protocol": "ftp",
      "data": {
        "type": "data",
        "filename": "test.txt",
        "size": 1024,
        "progress": 100
      }
    }
  ]
}
```

---

## 🔌 WebSocket 接口

### 实验实时通信

**连接 URL**: `ws://localhost:8000/ws/experiment/{experiment_id}`

**连接参数**:
- `experiment_id` - 实验 ID

### 客户端发送消息格式

```json
{
  "type": "packet_send",
  "data": {
    "packet": {...},
    "from": "node1",
    "to": "node2"
  }
}
```

**消息类型**:
- `packet_send` - 发送数据包
- `topology_change` - 拓扑变化
- `config_update` - 配置更新
- `ping` - 心跳

### 服务器推送消息格式

```json
{
  "type": "packet",
  "data": {
    "packet_id": "uuid",
    "protocol": "tcp",
    "position": {"x": 100, "y": 200},
    "state": "transmitting"
  },
  "timestamp": 1679997600
}
```

**推送类型**:
- `packet` - 数据包更新
- `topology` - 拓扑更新
- `event` - 事件通知
- `error` - 错误信息

---

## ❌ 错误响应格式

所有接口错误统一返回格式:

```json
{
  "detail": "错误描述信息"
}
```

**常见状态码**:
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `409` - 资源冲突
- `500` - 服务器内部错误

---

## 📝 使用示例

### cURL 示例

**注册**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'
```

**登录**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

**创建实验**:
```bash
curl -X POST http://localhost:8000/api/experiment/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"TCP 实验","protocol_type":"tcp","topology_data":{}}'
```

**TCP 握手**:
```bash
curl -X POST http://localhost:8000/api/experiment/tcp/handshake \
  -H "Content-Type: application/json" \
  -d '{"client":"192.168.1.10","server":"192.168.1.1"}'
```

---

## 📞 支持

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- 项目文档：`PROJECT_DESIGN.md`
