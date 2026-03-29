# NetLab 数据库设计文档

## 📋 数据库概览

### 数据库选择
- **生产环境**: MySQL 5.7+
- **开发/测试**: SQLite 3

### 连接字符串
```
# MySQL
mysql+pymysql://root:password@localhost:3306/network_teaching

# SQLite
sqlite:///./network_teaching.db
```

---

## 🗄️ 数据表设计

### 1. 用户表 (users)

存储用户账户信息。

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户 ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL, INDEX | 用户名 |
| email | VARCHAR(100) | UNIQUE, NOT NULL, INDEX | 邮箱 |
| hashed_password | VARCHAR(255) | NOT NULL | 加密密码 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否激活 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

**SQL 建表语句**:
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 2. 实验表 (experiments)

存储实验配置和状态。

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 实验 ID |
| title | VARCHAR(200) | NOT NULL | 实验标题 |
| description | TEXT | NULL | 实验描述 |
| protocol_type | VARCHAR(50) | NOT NULL | 协议类型 (TCP/UDP/HTTP/RIP/FTP) |
| topology_data | JSON | NULL | 拓扑结构数据 |
| config | JSON | NULL | 实验配置参数 |
| owner_id | INT | FOREIGN KEY (users.id) | 所有者 ID |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | 更新时间 |

**SQL 建表语句**:
```sql
CREATE TABLE experiments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    protocol_type VARCHAR(50) NOT NULL,
    topology_data JSON,
    config JSON,
    owner_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_protocol_type (protocol_type),
    INDEX idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 3. 拓扑表 (topologies)

存储网络拓扑结构。

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 拓扑 ID |
| name | VARCHAR(100) | NOT NULL | 拓扑名称 |
| description | TEXT | NULL | 拓扑描述 |
| nodes | JSON | NOT NULL | 节点数据 |
| connections | JSON | NOT NULL | 连接数据 |
| owner_id | INT | FOREIGN KEY (users.id) | 所有者 ID |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

**SQL 建表语句**:
```sql
CREATE TABLE topologies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    nodes JSON NOT NULL,
    connections JSON NOT NULL,
    owner_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 4. 会话表 (sessions)

存储用户会话信息。

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 会话 ID |
| user_id | INT | FOREIGN KEY (users.id) | 用户 ID |
| token | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | JWT Token |
| expires_at | DATETIME | NOT NULL | 过期时间 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

**SQL 建表语句**:
```sql
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5. 实验记录表 (experiment_logs)

记录实验操作历史。

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 记录 ID |
| experiment_id | INT | FOREIGN KEY (experiments.id) | 实验 ID |
| user_id | INT | FOREIGN KEY (users.id) | 用户 ID |
| action | VARCHAR(50) | NOT NULL | 操作类型 |
| data | JSON | NULL | 操作数据 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

**SQL 建表语句**:
```sql
CREATE TABLE experiment_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    experiment_id INT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 6. 数据包记录表 (packets)

记录实验中的数据包（用于回放和分析）。

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 记录 ID |
| experiment_id | INT | FOREIGN KEY (experiments.id) | 实验 ID |
| packet_id | VARCHAR(100) | NOT NULL | 数据包 UUID |
| protocol | VARCHAR(20) | NOT NULL | 协议类型 |
| source | VARCHAR(50) | NOT NULL | 源地址 |
| destination | VARCHAR(50) | NOT NULL | 目标地址 |
| data | JSON | NOT NULL | 数据包内容 |
| timestamp | BIGINT | NOT NULL | 时间戳 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |

**SQL 建表语句**:
```sql
CREATE TABLE packets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    experiment_id INT,
    packet_id VARCHAR(100) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL,
    destination VARCHAR(50) NOT NULL,
    data JSON NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_protocol (protocol),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 📊 实体关系图 (ERD)

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │   topologies    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ username        │       │ name            │
│ email           │       │ description     │
│ hashed_password │       │ nodes (JSON)    │
│ is_active       │       │ connections     │
│ created_at      │       │ owner_id (FK)   │
└────────┬────────┘       │ created_at      │
         │                └─────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│   experiments   │
├─────────────────┤
│ id (PK)         │
│ title           │
│ description     │
│ protocol_type   │
│ topology_data   │
│ config          │
│ owner_id (FK)   │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ experiment_logs │ │     packets     │ │    sessions     │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ id (PK)         │ │ id (PK)         │ │ id (PK)         │
│ experiment_id   │ │ experiment_id   │ │ user_id (FK)    │
│ user_id (FK)    │ │ packet_id       │ │ token           │
│ action          │ │ protocol        │ │ expires_at      │
│ data (JSON)     │ │ source          │ │ created_at      │
│ created_at      │ │ destination     │ │                 │
│                 │ │ data (JSON)     │ │                 │
│                 │ │ timestamp       │ │                 │
│                 │ │ created_at      │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 🔧 SQLAlchemy 模型

### User 模型

```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    experiments = relationship("Experiment", back_populates="owner", cascade="all, delete-orphan")
    topologies = relationship("Topology", back_populates="owner", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    logs = relationship("ExperimentLog", back_populates="user")
```

---

### Experiment 模型

```python
# app/models/experiment.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    protocol_type = Column(String(50), nullable=False)  # tcp, udp, http, rip, ftp
    topology_data = Column(JSON, nullable=True)
    config = Column(JSON, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    owner = relationship("User", back_populates="experiments")
    logs = relationship("ExperimentLog", back_populates="experiment", cascade="all, delete-orphan")
    packets = relationship("Packet", back_populates="experiment", cascade="all, delete-orphan")
```

---

### Topology 模型

```python
# app/models/topology.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Topology(Base):
    __tablename__ = "topologies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    nodes = Column(JSON, nullable=False)
    connections = Column(JSON, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    owner = relationship("User", back_populates="topologies")
```

---

### Session 模型

```python
# app/models/session.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="sessions")
    
    @property
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at
```

---

### ExperimentLog 模型

```python
# app/models/log.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ExperimentLog(Base):
    __tablename__ = "experiment_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False)  # create, update, delete, run, stop
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    experiment = relationship("Experiment", back_populates="logs")
    user = relationship("User", back_populates="logs")
```

---

### Packet 模型

```python
# app/models/packet.py
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Packet(Base):
    __tablename__ = "packets"
    
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    packet_id = Column(String(100), nullable=False, index=True)
    protocol = Column(String(20), nullable=False)
    source = Column(String(50), nullable=False)
    destination = Column(String(50), nullable=False)
    data = Column(JSON, nullable=False)
    timestamp = Column(BigInteger, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    experiment = relationship("Experiment", back_populates="packets")
```

---

## 📝 初始化脚本

### init_db.sql

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS network_teaching 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE network_teaching;

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 实验表
CREATE TABLE experiments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    protocol_type VARCHAR(50) NOT NULL,
    topology_data JSON,
    config JSON,
    owner_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_protocol_type (protocol_type),
    INDEX idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 拓扑表
CREATE TABLE topologies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    nodes JSON NOT NULL,
    connections JSON NOT NULL,
    owner_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 会话表
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 实验记录表
CREATE TABLE experiment_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    experiment_id INT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 数据包记录表
CREATE TABLE packets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    experiment_id INT,
    packet_id VARCHAR(100) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL,
    destination VARCHAR(50) NOT NULL,
    data JSON NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_protocol (protocol),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入测试用户 (密码：123456)
INSERT INTO users (username, email, hashed_password) VALUES 
('admin', 'admin@netlab.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('test', 'test@netlab.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');

-- 插入测试拓扑
INSERT INTO topologies (name, description, nodes, connections, owner_id) VALUES
('基础 TCP 拓扑', '客户端 - 服务器拓扑', 
 '{"nodes": [{"id": "client", "type": "host", "position": {"x": 100, "y": 100}}, {"id": "server", "type": "host", "position": {"x": 400, "y": 100}}]}',
 '{"connections": [{"id": "conn1", "source": "client", "destination": "server"}]}',
 1);
```

---

## 🔁 Alembic 迁移配置

### alembic.ini

```ini
[alembic]
script_location = alembic
sqlalchemy.url = mysql+pymysql://root:password@localhost/network_teaching

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### alembic/env.py

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

import sys
sys.path.insert(0, '.')

from app.database import Base
from app.models import user, experiment, topology, session, log, packet

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

---

## 📊 JSON 数据结构

### 节点数据 (nodes)

```json
{
  "nodes": [
    {
      "id": "host1",
      "type": "host",
      "config": {
        "ip": "192.168.1.10",
        "subnet_mask": "255.255.255.0",
        "gateway": "192.168.1.1",
        "dns": "8.8.8.8"
      },
      "position": {
        "x": 100,
        "y": 100
      },
      "interfaces": [
        {
          "name": "eth0",
          "ip": "192.168.1.10",
          "mac": "00:1A:2B:3C:4D:5E"
        }
      ]
    },
    {
      "id": "router1",
      "type": "router",
      "config": {
        "interfaces": [
          {"name": "eth0", "ip": "192.168.1.1"},
          {"name": "eth1", "ip": "192.168.2.1"}
        ],
        "routing_table": [
          {"destination": "192.168.1.0/24", "next_hop": "direct", "interface": "eth0"},
          {"destination": "192.168.2.0/24", "next_hop": "direct", "interface": "eth1"}
        ]
      },
      "position": {
        "x": 300,
        "y": 100
      }
    }
  ]
}
```

### 连接数据 (connections)

```json
{
  "connections": [
    {
      "id": "conn1",
      "source": "host1",
      "destination": "router1",
      "source_port": "eth0",
      "dest_port": "eth0",
      "type": "ethernet",
      "status": "active",
      "bandwidth": 1000,
      "delay": 1
    }
  ]
}
```

### 实验配置 (config)

```json
{
  "config": {
    "tcp": {
      "window_size": 3,
      "simulate_loss": false,
      "loss_rate": 0.1,
      "congestion_control": "reno"
    },
    "udp": {
      "mtu": 1500,
      "simulate_loss": false,
      "loss_rate": 0.1
    },
    "http": {
      "use_https": false,
      "server_port": 80
    },
    "rip": {
      "update_interval": 30,
      "split_horizon": true,
      "poison_reverse": true
    },
    "ftp": {
      "mode": "passive",
      "data_port": 20
    }
  }
}
```

---

## 📞 支持

- 项目设计文档：`PROJECT_DESIGN.md`
- API 接口文档：`API.md`
- 后端任务清单：`BACKEND_TASKS.md`
