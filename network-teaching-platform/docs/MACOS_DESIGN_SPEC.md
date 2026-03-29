# NetLab macOS Sonoma 设计规范文档

## 📋 全局设计规范

### 风格定位
严格遵循 **macOS Sonoma** 设计语言，打造沉浸式、专业级的网络协议学习平台。

---

## 🎨 视觉系统

### 颜色系统

#### 背景色
```css
--macos-bg-primary: #0a0a0f;      /* 主背景 */
--macos-bg-secondary: #16161d;    /* 次级背景 */
--macos-bg-tertiary: #1c1c24;     /* 第三级背景 */
```

#### 毛玻璃效果
```css
--macos-glass-dark: rgba(22, 22, 29, 0.65);
--macos-glass-light: rgba(255, 255, 255, 0.08);
--macos-glass-border: rgba(255, 255, 255, 0.12);
--macos-glass-blur: 40px;
```

#### 系统强调色
```css
--macos-blue: #007AFF;    /* 系统蓝 */
--macos-purple: #BF5AF2;  /* 系统紫 */
--macos-pink: #FF375F;    /* 系统粉 */
--macos-red: #FF453A;     /* 系统红 */
--macos-orange: #FF9500;  /* 系统橙 */
--macos-green: #30D158;   /* 系统绿 */
--macos-teal: #5AC8FA;    /* 系统青 */
```

#### 文本颜色
```css
--macos-text-primary: rgba(255, 255, 255, 1);
--macos-text-secondary: rgba(255, 255, 255, 0.7);
--macos-text-tertiary: rgba(255, 255, 255, 0.45);
```

---

## 📐 布局规范

### 导航栏 (Navigation Bar)
- **位置**: 固定在页面顶部
- **高度**: 52px
- **样式**: 磨砂玻璃背景，背景模糊，半透明效果
- **布局**: 
  - 左侧：Logo "NetLab"
  - 中间：主导航菜单
  - 右侧：主题切换/GitHub 图标
- **交互**: 首页透明，悬停/滚动时显现毛玻璃效果

### 右侧 OSI 面板
- **宽度**: 280px
- **样式**: 可伸缩的磨砂玻璃侧边栏
- **位置**: 固定右侧，从导航栏下方延伸至底部
- **内容**: 展示 OSI 七层模型协议数据

### 底部 Dock 工具栏
- **高度**: 80px
- **样式**: macOS Dock 风格，悬停放大效果
- **位置**: 固定在页面底部，居中显示
- **内容**: 快速导航图标

---

## 🎭 组件规范

### 导航栏组件
```tsx
<Navigation 
  transparent={true}   // 首页透明模式
  showMenu={true}      // 显示菜单
/>
```

**特性**:
- 滚动时自动显现毛玻璃背景
- 悬停时增加不透明度
- 菜单项选中状态高亮
- 响应式折叠（移动端）

### Dock 组件
```tsx
<Dock />
```

**特性**:
- 悬停放大效果（scale 1.2）
- 弹簧动画过渡
- 活动状态指示器
- 毛玻璃背景

### OSI 面板组件
```tsx
<OSIPanel 
  visible={true} 
  data={osiData}
  onClose={() => setVisible(false)}
/>
```

**特性**:
- 可折叠的协议层级
- 字段详情展示
- 十六进制数据视图

---

## 📄 页面规范

### 1. 首页 - 沉浸式引导页

**导航栏**: 全透明，悬停时显现毛玻璃

**视觉重心**: 
- 全屏深邃背景
- 动态粒子网络动画（点和线构成的几何网络）
- 流动光效

**核心内容**:
```tsx
<Title>NetLab</Title>
<Paragraph>探索网络协议的奥秘</Paragraph>
<Button breathing>开始学习</Button>
```

**特性卡片**: 3 个毛玻璃卡片，展示核心功能

---

### 2. 课程选择页 (Launchpad 风格)

**布局**: 类似 macOS Launchpad 的网格布局

**卡片规格**:
- 尺寸：320px × 420px
- 圆角：32px
- 毛玻璃背景
- 悬停上浮效果（translateY -12px）

**卡片内容**:
- 渐变色图标（80×80px）
- 协议标题
- 副标题
- 简短描述
- 特性标签
- 行动按钮

---

### 3. 协议学习页面

**布局**:
- 中央：知识卡片区域
- 右侧：OSI 面板（实验时展开）

**知识卡片**:
- 滑动翻页
- 底部圆点指示器
- 最后一张显示"进入实验"按钮（呼吸灯效果）

**实验画布**:
- 网格背景
- 拓扑显示区
- 参数控制面板

---

## ✨ 动画规范

### 过渡动画
```css
--macos-transition-fast: 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
--macos-transition-normal: 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
--macos-transition-slow: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 呼吸灯动画
```css
@keyframes breathing {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 122, 255, 0.4); }
  50% { box-shadow: 0 0 40px rgba(0, 122, 255, 0.8); }
}
```

### 浮动动画
```css
@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### 粒子动画
- 粒子数量：按屏幕面积计算（每 15000px² 一个粒子）
- 移动速度：0.5px/frame
- 连接线距离阈值：150px

---

## 🔧 技术实现

### 技术栈
- **框架**: React 18 + TypeScript
- **UI 库**: Ant Design 5（定制化主题）
- **状态管理**: Zustand
- **动画**: Framer Motion + CSS Animations
- **构建工具**: Vite 5

### 目录结构
```
src/
├── components/
│   ├── Navigation/    # 导航栏
│   ├── Dock/          # Dock 工具栏
│   ├── OSIPanel/      # OSI 分析面板
│   └── GlassCard/     # 毛玻璃卡片
├── pages/
│   ├── Home/          # 首页
│   ├── Courses/       # 课程选择页
│   ├── ProtocolLearning/ # 协议学习页
│   ├── TCP/           # TCP 协议页
│   ├── UDP/           # UDP 协议页
│   ├── HTTP/          # HTTP 协议页
│   ├── RIP/           # RIP 协议页
│   ├── FTP/           # FTP 协议页
│   └── FreeLab/       # 自由实验室
└── styles/
    └── index.css      # 全局样式
```

---

## 📱 响应式规范

### 断点
```css
/* Desktop: > 1200px */
/* Laptop: 900px - 1200px */
/* Tablet: 768px - 900px */
/* Mobile: < 768px */
```

### 适配规则
- **导航栏**: 移动端折叠为汉堡菜单
- **课程网格**: 移动端单列显示
- **OSI 面板**: 移动端隐藏
- **Dock**: 移动端缩小图标尺寸

---

## 🎯 交互细节

### 悬停效果
- 卡片：上浮 8-12px，阴影增强
- 按钮：放大 5%，阴影增强
- 图标：放大 10-20%

### 点击反馈
- 按钮：按下效果（scale 0.98）
- 菜单项：背景高亮
- 卡片：边框高亮

### 加载状态
- 骨架屏：毛玻璃背景
- 进度指示：渐变动画

---

## 📝 开发清单

### 已完成
- [x] macOS Sonoma 全局样式系统
- [x] 毛玻璃导航栏组件
- [x] 首页粒子背景动画
- [x] Launchpad 风格课程选择页
- [x] 协议学习页面框架
- [x] OSI 分析面板
- [x] macOS Dock 工具栏
- [x] 所有协议页面（TCP/UDP/HTTP/RIP/FTP）
- [x] 自由实验室页面

### 待开发
- [ ] 知识卡片滑动动画
- [ ] 实验画布拓扑引擎
- [ ] 数据包动画系统
- [ ] WebSocket 实时通信
- [ ] 协议模拟后端对接

---

## 🔗 参考资源

- [macOS Design Resources](https://developer.apple.com/design/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos/overview/themes/)
- [SF Pro Font](https://developer.apple.com/fonts/)

---

**最后更新**: 2026-03-28
**版本**: 1.0.0
