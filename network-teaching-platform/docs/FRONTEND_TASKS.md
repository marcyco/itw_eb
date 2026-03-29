# NetLab 前端开发任务清单

## 📋 任务概览

| 阶段 | 任务 | 优先级 | 预计工时 | 状态 |
|------|------|--------|----------|------|
| 1 | 项目初始化 | P0 | 2 天 | ⏳ |
| 1 | 基础 UI 组件库 | P0 | 5 天 | ⏳ |
| 1 | 全局样式系统 | P0 | 2 天 | ⏳ |
| 2 | 知识卡片组件 | P0 | 5 天 | ⏳ |
| 2 | 实验画布引擎 | P0 | 7 天 | ⏳ |
| 2 | WebSocket 客户端 | P0 | 3 天 | ⏳ |
| 3 | TCP 协议页面 | P0 | 5 天 | ⏳ |
| 3 | UDP 协议页面 | P0 | 4 天 | ⏳ |
| 3 | HTTP 协议页面 | P0 | 5 天 | ⏳ |
| 3 | RIP 协议页面 | P1 | 4 天 | ⏳ |
| 3 | FTP 协议页面 | P1 | 4 天 | ⏳ |
| 4 | 自由实验室 | P1 | 7 天 | ⏳ |
| 5 | 测试与优化 | P1 | 5 天 | ⏳ |

---

## 🚀 第一阶段：基础架构

### 1.1 项目初始化

**任务描述**: 创建 React + TypeScript + Vite 项目

**具体工作**:
- [ ] 使用 Vite 创建 React + TypeScript 项目
- [ ] 配置 TypeScript (tsconfig.json)
- [ ] 配置 ESLint + Prettier
- [ ] 配置路径别名 (@/)
- [ ] 安装基础依赖

**依赖安装**:
```bash
npm install react react-dom react-router-dom
npm install antd @ant-design/icons
npm install zustand
npm install framer-motion
npm install axios
npm install dayjs
npm install -D @types/react @types/react-dom
npm install -D typescript
npm install -D vite @vitejs/plugin-react
npm install -D eslint prettier
npm install -D tailwindcss postcss autoprefixer
```

**交付物**:
- [ ] 可运行的空项目
- [ ] 基础目录结构
- [ ] 代码规范配置

---

### 1.2 全局样式系统

**任务描述**: 实现 macOS Sonoma 风格的全局样式系统

**具体工作**:
- [ ] 创建全局样式变量 (CSS Custom Properties)
- [ ] 实现毛玻璃效果 mixin
- [ ] 配置深色主题
- [ ] 创建动画关键帧

**样式变量**:
```css
:root {
  /* 颜色 */
  --color-bg-primary: #1a1a2e;
  --color-bg-secondary: #16213e;
  --color-bg-glass: rgba(255, 255, 255, 0.1);
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.7);
  --color-accent: #007AFF;
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-error: #FF3B30;
  
  /* 毛玻璃效果 */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: blur(20px);
  --glass-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  /* 动画 */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

**交付物**:
- [ ] `src/styles/variables.css`
- [ ] `src/styles/globals.css`
- [ ] `src/styles/animations.css`

---

### 1.3 基础 UI 组件库

**任务描述**: 基于 Ant Design 封装符合设计规范的组件

**具体工作**:

#### 1.3.1 GlassCard 组件
```tsx
// src/components/GlassCard/index.tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  transparency?: number;
  hoverable?: boolean;
}
```
- [ ] 实现毛玻璃背景效果
- [ ] 支持自定义模糊度
- [ ] 支持 hover 动画
- [ ] 响应式适配

#### 1.3.2 Navigation 组件
```tsx
// src/components/Navigation/index.tsx
interface NavigationProps {
  logo?: string;
  menuItems: MenuItem[];
  onMenuClick?: (key: string) => void;
}
```
- [ ] 固定顶部导航栏
- [ ] 毛玻璃效果
- [ ] 菜单项高亮
- [ ] 响应式折叠

#### 1.3.3 Button 组件
```tsx
// src/components/Button/index.tsx
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  breathing?: boolean;  // 呼吸灯效果
  onClick?: () => void;
}
```
- [ ] 胶囊圆角样式
- [ ] hover 缩放效果
- [ ] 呼吸灯动画
- [ ] loading 状态

#### 1.3.4 Slider 组件（卡片翻页）
```tsx
// src/components/Slider/index.tsx
interface SliderProps {
  pages: React.ReactNode[];
  currentPage: number;
  onPageChange: (index: number) => void;
  showDots?: boolean;
}
```
- [ ] 左右滑动切换
- [ ] 底部圆点指示器
- [ ] 触摸手势支持
- [ ] 键盘左右键支持

**交付物**:
- [ ] `src/components/GlassCard/`
- [ ] `src/components/Navigation/`
- [ ] `src/components/Button/`
- [ ] `src/components/Slider/`
- [ ] 组件文档

---

## 🎯 第二阶段：核心功能

### 2.1 知识卡片组件

**任务描述**: 实现可滑动的知识卡片系统

**具体工作**:

#### 卡片容器
```tsx
// src/components/KnowledgeCard/index.tsx
interface KnowledgeCardProps {
  title: string;
  content: React.ReactNode;
  diagram?: React.ReactNode;
  isActive?: boolean;
}
```

#### 卡片内容要求
- [ ] 标题区域（大字体，居中）
- [ ] 内容区域（支持 Markdown/富文本）
- [ ] 图解区域（支持 SVG/Canvas 动画）
- [ ] 底部操作区（圆点指示器 + 进入实验按钮）

#### 动画效果
- [ ] 卡片滑入/滑出动画
- [ ] 进入实验按钮呼吸灯效果
- [ ] 卡片向上飞出动画

**交付物**:
- [ ] `src/components/KnowledgeCard/`
- [ ] 卡片动画演示

---

### 2.2 实验画布引擎

**任务描述**: 实现网络拓扑仿真画布

**具体工作**:

#### 画布基础
```tsx
// src/components/Canvas/ExperimentCanvas.tsx
interface ExperimentCanvasProps {
  topology: TopologyData;
  onTopologyChange?: (topology: TopologyData) => void;
  gridSize?: number;
  showGrid?: boolean;
}
```

#### 设备节点
```tsx
// src/components/Canvas/DeviceNode.tsx
interface DeviceNodeProps {
  device: Device;
  isSelected?: boolean;
  isDragging?: boolean;
  onSelect?: (id: string) => void;
  onDrag?: (position: Position) => void;
}
```

#### 连线组件
```tsx
// src/components/Canvas/ConnectionLine.tsx
interface ConnectionLineProps {
  connection: Connection;
  packets?: Packet[];
  isSelected?: boolean;
}
```

#### 数据包动画
```tsx
// src/components/Canvas/PacketAnimation.tsx
interface PacketAnimationProps {
  packet: Packet;
  path: Position[];
  speed?: number;
  onComplete?: () => void;
}
```

**功能要求**:
- [ ] 网格背景（可开关）
- [ ] 设备拖拽
- [ ] 连线绘制
- [ ] 数据包动画
- [ ] 缩放/平移
- [ ] 选中高亮

**交付物**:
- [ ] `src/components/Canvas/`
- [ ] 画布交互演示

---

### 2.3 OSI 分析面板

**任务描述**: 实现协议数据解析面板

**具体工作**:

```tsx
// src/components/OSIPanel/index.tsx
interface OSIPanelProps {
  isVisible?: boolean;
  data?: OSIData;
  onClose?: () => void;
}
```

#### 面板层级展示
- [ ] 物理层（比特流）
- [ ] 数据链路层（帧）
- [ ] 网络层（IP 包）
- [ ] 传输层（TCP/UDP 段）
- [ ] 应用层（HTTP/FTP 等）

#### 数据展示格式
- [ ] 十六进制视图
- [ ] 二进制视图
- [ ] 字段解析视图
- [ ] 高亮选中字段

**交付物**:
- [ ] `src/components/OSIPanel/`
- [ ] 协议解析演示

---

### 2.4 WebSocket 客户端

**任务描述**: 实现与后端的实时通信

**具体工作**:

```tsx
// src/hooks/useWebSocket.ts
interface WebSocketMessage {
  type: 'packet' | 'topology' | 'experiment';
  data: any;
}

function useWebSocket(url: string): {
  sendMessage: (msg: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
};
```

**功能要求**:
- [ ] 自动重连机制
- [ ] 心跳保活
- [ ] 消息队列
- [ ] 连接状态管理

**交付物**:
- [ ] `src/hooks/useWebSocket.ts`
- [ ] `src/services/websocket.ts`

---

## 📚 第三阶段：协议模块

### 3.1 TCP 协议页面

**任务描述**: 实现 TCP 协议学习页面

**具体工作**:

#### 知识卡片内容
- [ ] 卡片 1: 三次握手动图
- [ ] 卡片 2: 滑动窗口动画
- [ ] 卡片 3: 拥塞控制曲线

#### 实验场景
- [ ] 客户端 - 服务器拓扑
- [ ] 参数配置面板
- [ ] 数据包 Seq/Ack 显示
- [ ] 丢包模拟
- [ ] OSI 面板 TCP 段解析

**文件结构**:
```
src/pages/TCP/
├── index.tsx           # 页面入口
├── KnowledgeCards.tsx  # 知识卡片
├── Experiment.tsx      # 实验画布
├── ControlPanel.tsx    # 控制面板
└── utils.ts            # TCP 工具函数
```

**交付物**:
- [ ] 完整的 TCP 学习页面
- [ ] 交互动画流畅

---

### 3.2 UDP 协议页面

**任务描述**: 实现 UDP 协议学习页面

**具体工作**:

#### 知识卡片内容
- [ ] 卡片 1: UDP 无连接特性
- [ ] 卡片 2: IP 分片动画
- [ ] 卡片 3: 应用场景展示

#### 实验场景
- [ ] 广播拓扑（A→B+C）
- [ ] MTU 分片模拟
- [ ] 丢包导致重组失败
- [ ] OSI 面板 UDP 报文解析

**文件结构**:
```
src/pages/UDP/
├── index.tsx
├── KnowledgeCards.tsx
├── Experiment.tsx
├── ControlPanel.tsx
└── utils.ts
```

**交付物**:
- [ ] 完整的 UDP 学习页面

---

### 3.3 HTTP 协议页面

**任务描述**: 实现 HTTP 协议学习页面

**具体工作**:

#### 知识卡片内容
- [ ] 卡片 1: 请求响应流程图
- [ ] 卡片 2: 状态码与 Header
- [ ] 卡片 3: TLS 握手动画

#### 实验场景
- [ ] 浏览器 - 服务器拓扑
- [ ] 请求构造器（Method/URL/Header/Body）
- [ ] 响应展示
- [ ] HTTPS/TLS 模拟
- [ ] OSI 面板 HTTP 报文解析

**文件结构**:
```
src/pages/HTTP/
├── index.tsx
├── KnowledgeCards.tsx
├── Experiment.tsx
├── RequestBuilder.tsx   # 请求构造器
├── ControlPanel.tsx
└── utils.ts
```

**交付物**:
- [ ] 完整的 HTTP 学习页面

---

### 3.4 RIP 协议页面

**任务描述**: 实现 RIP 协议学习页面

**具体工作**:

#### 知识卡片内容
- [ ] 卡片 1: 距离矢量算法
- [ ] 卡片 2: 路由收敛过程
- [ ] 卡片 3: 环路避免机制

#### 实验场景
- [ ] 多路由器拓扑（R1-R2-R3）
- [ ] 路由表悬浮窗
- [ ] RIP 更新包传播动画
- [ ] 链路故障模拟
- [ ] OSI 面板 RIP 报文解析

**文件结构**:
```
src/pages/RIP/
├── index.tsx
├── KnowledgeCards.tsx
├── Experiment.tsx
├── RoutingTable.tsx    # 路由表组件
├── ControlPanel.tsx
└── utils.ts
```

**交付物**:
- [ ] 完整的 RIP 学习页面

---

### 3.5 FTP 协议页面

**任务描述**: 实现 FTP 协议学习页面

**具体工作**:

#### 知识卡片内容
- [ ] 卡片 1: 控制/数据连接
- [ ] 卡片 2: 主动/被动模式对比
- [ ] 卡片 3: FTP 命令与响应

#### 实验场景
- [ ] 双连接拓扑（控制 + 数据）
- [ ] 模式选择（主动/被动）
- [ ] 登录流程模拟
- [ ] 文件上传/下载动画
- [ ] OSI 面板 FTP 命令解析

**文件结构**:
```
src/pages/FTP/
├── index.tsx
├── KnowledgeCards.tsx
├── Experiment.tsx
├── LoginForm.tsx       # 登录表单
├── ControlPanel.tsx
└── utils.ts
```

**交付物**:
- [ ] 完整的 FTP 学习页面

---

## 🔬 第四阶段：自由实验室

### 4.1 设备库组件

**任务描述**: 实现可拖拽的设备库

**具体工作**:

```tsx
// src/components/DeviceLibrary/index.tsx
interface DeviceLibraryProps {
  isVisible?: boolean;
  onDragStart?: (device: DeviceType) => void;
}
```

**设备类型**:
- [ ] 主机（Host）
- [ ] 路由器（Router）
- [ ] 交换机（Switch）
- [ ] 云（Cloud）

**交付物**:
- [ ] `src/components/DeviceLibrary/`

---

### 4.2 配置面板

**任务描述**: 实现设备配置面板

**具体工作**:

```tsx
// src/components/ConfigPanel/index.tsx
interface ConfigPanelProps {
  device?: Device;
  onConfigChange?: (config: DeviceConfig) => void;
}
```

**配置项**:
- [ ] IP 地址
- [ ] 子网掩码
- [ ] 默认网关
- [ ] DNS 服务器
- [ ] 端口配置

**交付物**:
- [ ] `src/components/ConfigPanel/`

---

### 4.3 分析面板（Wireshark 风格）

**任务描述**: 实现协议分析面板

**具体工作**:

```tsx
// src/components/AnalysisPanel/index.tsx
interface AnalysisPanelProps {
  packet?: Packet;
  connection?: Connection;
}
```

**功能要求**:
- [ ] 数据包列表
- [ ] 协议树形展开
- [ ] 十六进制视图
- [ ] 过滤表达式
- [ ] 抓包控制

**交付物**:
- [ ] `src/components/AnalysisPanel/`

---

### 4.4 自由实验室页面

**任务描述**: 整合所有组件实现自由实验室

**具体工作**:

```tsx
// src/pages/FreeLab/index.tsx
```

**布局**:
```
┌─────────────────────────────────────────────────────────────┐
│                      顶部导航栏                              │
├──────────┬──────────────────────────────────────┬───────────┤
│          │                                      │           │
│  设备库  │            实验画布                   │  配置/    │
│  (左侧)  │          (中央区域)                   │  分析面板 │
│          │                                      │  (右侧)   │
│          │                                      │           │
└──────────┴──────────────────────────────────────┴───────────┘
```

**功能要求**:
- [ ] 拖拽设备到画布
- [ ] 手动连线（端口级）
- [ ] 点击设备显示配置
- [ ] 点击连线显示分析
- [ ] ping 命令模拟
- [ ] 模拟丢包

**交付物**:
- [ ] `src/pages/FreeLab/`
- [ ] 完整的自由实验室

---

## 🧪 第五阶段：测试与优化

### 5.1 单元测试

**任务描述**: 编写组件单元测试

**具体工作**:
- [ ] 安装测试库（Vitest + React Testing Library）
- [ ] 编写基础组件测试
- [ ] 编写页面组件测试
- [ ] 编写工具函数测试

**依赖安装**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**交付物**:
- [ ] 测试覆盖率报告
- [ ] 关键组件测试用例

---

### 5.2 集成测试

**任务描述**: 端到端测试

**具体工作**:
- [ ] 安装 Playwright
- [ ] 编写用户流程测试
- [ ] 编写协议模块测试
- [ ] 编写自由实验室测试

**依赖安装**:
```bash
npm install -D @playwright/test
```

**交付物**:
- [ ] E2E 测试脚本
- [ ] 测试报告

---

### 5.3 性能优化

**任务描述**: 优化应用性能

**具体工作**:
- [ ] 代码分割（Code Splitting）
- [ ] 懒加载（Lazy Loading）
- [ ] 图片/动画资源优化
- [ ] 内存泄漏检查
- [ ] 渲染性能分析

**交付物**:
- [ ] 性能测试报告
- [ ] Lighthouse 评分

---

### 5.4 UI/UX 优化

**任务描述**: 优化用户体验

**具体工作**:
- [ ] 响应式适配（移动端/平板）
- [ ] 加载状态优化
- [ ] 错误提示优化
- [ ] 动画流畅度优化
- [ ] 无障碍访问支持

**交付物**:
- [ ] 响应式测试报告
- [ ] UX 改进清单

---

## 📦 交付清单

### 代码交付
- [ ] 完整的源代码
- [ ] TypeScript 类型定义
- [ ] 组件文档
- [ ] 测试用例

### 文档交付
- [ ] README.md
- [ ] 开发指南
- [ ] 部署指南
- [ ] API 使用文档

### 构建产物
- [ ] 生产环境构建
- [ ] Docker 镜像（可选）
- [ ] 静态资源 CDN 配置

---

## 📞 联系方式

如有问题，请联系：
- 项目负责人
- 技术文档：`PROJECT_DESIGN.md`
- 后端任务：`BACKEND_TASKS.md`
