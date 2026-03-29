# NetLab 深度网络协议交互平台

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.104+-green.svg)

**基于 macOS Sonoma 设计语言的网络协议可视化教学平台**

[项目设计](./PROJECT_DESIGN.md) | [前端任务](./docs/FRONTEND_TASKS.md) | [后端任务](./docs/BACKEND_TASKS.md) | [API 文档](./docs/API.md) | [数据库设计](./docs/DATABASE.md)

</div>

---

## 📖 项目简介

NetLab 是一款专为网络协议教学设计的学习平台，通过交互式知识卡片和仿真实验，帮助用户深入理解网络协议的核心机制。

### 核心特性

- 🎨 **macOS Sonoma 设计语言** - 高透明度毛玻璃效果，深灰渐变背景
- 📚 **滑动式知识卡片** - 每页聚焦一个知识点，支持左右滑动翻页
- 🔬 **交互式实验** - 从知识卡片直接进入模板实验，边学边练
- 📊 **OSI 面板分析** - 点击数据包/设备，展示对应层级详细数据
- 🌐 **多协议支持** - TCP、UDP、HTTP、RIP、FTP 五大核心协议
- 🧪 **自由实验室** - 拖拽设备、手动连线、配置参数、抓包分析

---

## 🎯 支持协议

| 协议 | 知识卡片 | 模板实验 | 核心功能 |
|------|----------|----------|----------|
| **TCP** | ✅ 三次握手、滑动窗口、拥塞控制 | ✅ 滑动窗口发送、快速重传 | Seq/Ack 分析、拥塞控制算法 |
| **UDP** | ✅ 无连接特性、分片重组、应用场景 | ✅ 广播、MTU 分片 | 分片偏移量、重组验证 |
| **HTTP** | ✅ 请求响应、状态码、TLS 握手 | ✅ 请求构造、HTTPS 模拟 | 报文解析、TLS 加密流程 |
| **RIP** | ✅ 距离矢量、路由收敛、环路避免 | ✅ 多路由器拓扑、链路故障 | 路由表更新、水平分割 |
| **FTP** | ✅ 控制/数据连接、主动/被动模式 | ✅ 登录、文件上传下载 | 命令解析、双连接模拟 |

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    前端 (React 18 + TypeScript)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  知识卡片   │  │  实验画布   │  │      OSI 分析面板       │  │
│  │  组件模块   │  │  仿真引擎   │  │      协议解析器         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         Ant Design 5 + Framer Motion + Zustand                  │
└──────────────────────────────┼───────────────────────────────────┘
                               │ WebSocket + HTTP
┌──────────────────────────────┼───────────────────────────────────┐
│                    后端 (Python + FastAPI)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  REST API   │  │  WebSocket  │  │     协议模拟引擎        │  │
│  │  控制器     │  │  处理器     │  │     数据包生成器        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│              SQLAlchemy + Pydantic + python-jose                │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                    数据库 (MySQL 5.7+ / SQLite)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    User     │  │ Experiment  │  │       Topology          │  │
│  │    表       │  │    表       │  │        表               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 项目结构

```
network-teaching-platform/
├── backend/                      # 后端服务
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI 应用入口
│   │   ├── config.py            # 配置管理
│   │   ├── database.py          # 数据库连接
│   │   ├── models/              # SQLAlchemy 模型
│   │   ├── schemas/             # Pydantic 模式
│   │   ├── api/                 # API 路由
│   │   ├── core/                # 核心逻辑
│   │   │   ├── security.py      # 认证安全
│   │   │   └── protocol/        # 协议模拟
│   │   └── websocket/           # WebSocket 处理
│   ├── venv/                    # Python 虚拟环境
│   ├── requirements.txt         # Python 依赖
│   └── test_start.bat           # 启动脚本
│
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/          # 通用组件
│   │   │   ├── GlassCard/       # 毛玻璃卡片
│   │   │   ├── Navigation/      # 导航栏
│   │   │   ├── OSIPanel/        # OSI 面板
│   │   │   └── PacketAnimation/ # 数据包动画
│   │   ├── pages/               # 页面组件
│   │   │   ├── TCP/
│   │   │   ├── UDP/
│   │   │   ├── HTTP/
│   │   │   ├── RIP/
│   │   │   ├── FTP/
│   │   │   └── FreeLab/
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── stores/              # 状态管理
│   │   ├── services/            # API 服务
│   │   └── styles/              # 全局样式
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                         # 项目文档
│   ├── PROJECT_DESIGN.md        # 项目设计文档
│   ├── FRONTEND_TASKS.md        # 前端任务清单
│   ├── BACKEND_TASKS.md         # 后端任务清单
│   ├── API.md                   # API 接口文档
│   └── DATABASE.md              # 数据库设计文档
│
└── README.md                     # 本文件
```

---

## 🚀 快速开始

### 后端启动

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 方式一：使用 SQLite（快速测试）
# 修改 app/core/config.py 中的 DATABASE_URL 为：
# DATABASE_URL = "sqlite:///./test.db"

# 方式二：使用 MySQL（生产环境）
# 1. 安装 MySQL 5.7+
# 2. 执行 docs/init_db.sql 初始化数据库
# 3. 配置 .env 文件

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**访问**:
- API 文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/health

---

### 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

**访问**: http://localhost:5173

---

## 📋 开发任务

### 前端任务

详细任务清单请查看：[docs/FRONTEND_TASKS.md](./docs/FRONTEND_TASKS.md)

| 阶段 | 任务 | 优先级 | 预计工时 |
|------|------|--------|----------|
| 1 | 项目初始化 | P0 | 2 天 |
| 1 | 基础 UI 组件库 | P0 | 5 天 |
| 2 | 知识卡片组件 | P0 | 5 天 |
| 2 | 实验画布引擎 | P0 | 7 天 |
| 3 | TCP/UDP/HTTP 协议页面 | P0 | 14 天 |
| 4 | 自由实验室 | P1 | 7 天 |

---

### 后端任务

详细任务清单请查看：[docs/BACKEND_TASKS.md](./docs/BACKEND_TASKS.md)

| 阶段 | 任务 | 优先级 | 预计工时 |
|------|------|--------|----------|
| 1 | 项目初始化 | P0 | 1 天 |
| 1 | 数据库设计 | P0 | 3 天 |
| 1 | 认证系统 | P0 | 2 天 |
| 2 | WebSocket 服务 | P0 | 3 天 |
| 2 | 协议模拟引擎 | P0 | 5 天 |
| 3 | 各协议模块 | P0/P1 | 18 天 |

---

## 🧪 测试

### 后端测试

```bash
cd backend
pytest tests/ -v --cov=app
```

### 前端测试

```bash
cd frontend
npm run test
```

---

## 📚 文档导航

| 文档 | 描述 |
|------|------|
| [PROJECT_DESIGN.md](./PROJECT_DESIGN.md) | 完整项目设计，含功能模块、视觉规范 |
| [docs/FRONTEND_TASKS.md](./docs/FRONTEND_TASKS.md) | 前端开发任务清单，含组件 API |
| [docs/BACKEND_TASKS.md](./docs/BACKEND_TASKS.md) | 后端开发任务清单，含协议模拟实现 |
| [docs/API.md](./docs/API.md) | REST API 和 WebSocket 接口文档 |
| [docs/DATABASE.md](./docs/DATABASE.md) | 数据库设计，含模型和初始化脚本 |

---

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **UI 库**: Ant Design 5
- **状态管理**: Zustand
- **动画**: Framer Motion
- **构建工具**: Vite
- **样式**: CSS Modules + CSS Variables

### 后端
- **框架**: FastAPI
- **ORM**: SQLAlchemy
- **验证**: Pydantic
- **认证**: python-jose (JWT)
- **密码**: Passlib (bcrypt)
- **数据库驱动**: PyMySQL

### 数据库
- **生产**: MySQL 5.7+
- **开发**: SQLite 3

---

## 📝 开发规范

### 代码风格
- 前端：ESLint + Prettier
- 后端：Black + Flake8

### 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建/工具链相关
```

---

## 📅 开发计划

| 阶段 | 时间 | 目标 |
|------|------|------|
| 第一阶段 | 2 周 | 基础架构搭建 |
| 第二阶段 | 4 周 | 核心功能开发 |
| 第三阶段 | 4 周 | 协议模块实现 |
| 第四阶段 | 2 周 | 自由实验室 |
| 第五阶段 | 2 周 | 测试与优化 |

**总计**: 约 14 周

---

## 👥 团队协作

- **前端开发**: 参考 `docs/FRONTEND_TASKS.md`
- **后端开发**: 参考 `docs/BACKEND_TASKS.md`
- **接口对接**: 参考 `docs/API.md`
- **数据库设计**: 参考 `docs/DATABASE.md`

---

## 📄 许可证

MIT License

---

## 📞 支持

如有问题，请查看相关文档或联系项目维护人员。

**文档索引**:
- 📘 [项目设计](./PROJECT_DESIGN.md)
- 🎨 [前端任务](./docs/FRONTEND_TASKS.md)
- ⚙️ [后端任务](./docs/BACKEND_TASKS.md)
- 🔌 [API 文档](./docs/API.md)
- 🗄️ [数据库设计](./docs/DATABASE.md)
