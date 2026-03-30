/**
 * 实验画布组件 - 实验室风格优化版
 * 流畅拖拽 + 实验室科技感效果
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, Slider, Switch, Tag, Space, Typography, Tooltip, message } from 'antd'
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  DeleteOutlined,
  DesktopOutlined,
  ApartmentOutlined,
  SwapOutlined,
  CloudOutlined,
  SettingOutlined,
  LinkOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import './index.css'

const { Title } = Typography

export type DeviceType = 'host' | 'router' | 'switch' | 'cloud'

export interface Device {
  id: string
  type: DeviceType
  x: number
  y: number
  config: {
    name: string
    ip?: string
    subnetMask?: string
    gateway?: string
    mac?: string
  }
}

export interface Connection {
  id: string
  source: string
  destination: string
  sourcePort?: string
  destPort?: string
  status: 'active' | 'inactive'
}

export interface Packet {
  id: string
  protocol: string
  data: any
  source: string
  destination: string
  currentProgress: number
  speed: number
}

export interface ExperimentCanvasProps {
  protocol: string
  config?: {
    windowSize?: number
    simulateLoss?: boolean
    congestionControl?: string
    mtu?: number
  }
  onBack: () => void
}

// 默认拓扑配置
const getDefaultTopology = (protocol: string): { devices: Device[]; connections: Connection[] } => {
  switch (protocol) {
    case 'tcp':
      return {
        devices: [
          { id: 'client1', type: 'host', x: 100, y: 200, config: { name: '客户端', ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:5E' } },
          { id: 'server1', type: 'host', x: 600, y: 200, config: { name: '服务器', ip: '192.168.1.1', mac: '00:1A:2B:3C:4D:5F' } },
        ],
        connections: [
          { id: 'conn1', source: 'client1', destination: 'server1', status: 'active' },
        ],
      }
    case 'udp':
      return {
        devices: [
          { id: 'hostA', type: 'host', x: 100, y: 200, config: { name: '主机 A', ip: '192.168.1.10' } },
          { id: 'hostB', type: 'host', x: 400, y: 100, config: { name: '主机 B', ip: '192.168.1.20' } },
          { id: 'hostC', type: 'host', x: 400, y: 300, config: { name: '主机 C', ip: '192.168.1.30' } },
        ],
        connections: [
          { id: 'conn1', source: 'hostA', destination: 'hostB', status: 'active' },
          { id: 'conn2', source: 'hostA', destination: 'hostC', status: 'active' },
        ],
      }
    case 'rip':
      return {
        devices: [
          { id: 'router1', type: 'router', x: 100, y: 200, config: { name: 'R1', ip: '192.168.1.1' } },
          { id: 'router2', type: 'router', x: 400, y: 100, config: { name: 'R2', ip: '192.168.2.1' } },
          { id: 'router3', type: 'router', x: 400, y: 300, config: { name: 'R3', ip: '192.168.3.1' } },
        ],
        connections: [
          { id: 'conn1', source: 'router1', destination: 'router2', status: 'active' },
          { id: 'conn2', source: 'router1', destination: 'router3', status: 'active' },
          { id: 'conn3', source: 'router2', destination: 'router3', status: 'active' },
        ],
      }
    default:
      return {
        devices: [
          { id: 'host1', type: 'host', x: 150, y: 200, config: { name: '主机 1', ip: '192.168.1.10' } },
          { id: 'host2', type: 'host', x: 550, y: 200, config: { name: '主机 2', ip: '192.168.1.20' } },
        ],
        connections: [
          { id: 'conn1', source: 'host1', destination: 'host2', status: 'active' },
        ],
      }
  }
}

// 设备类型配置
const DEVICE_CONFIG: Record<DeviceType, { icon: any; color: string; label: string; portColor: string }> = {
  host: { icon: DesktopOutlined, color: '#007AFF', label: '主机', portColor: '#00D4FF' },
  router: { icon: ApartmentOutlined, color: '#FF9500', label: '路由器', portColor: '#FFD60A' },
  switch: { icon: SwapOutlined, color: '#30D158', label: '交换机', portColor: '#32D74B' },
  cloud: { icon: CloudOutlined, color: '#BF5AF2', label: '云', portColor: '#E0A6FF' },
}

export default function ExperimentCanvas({ protocol, config = {}, onBack }: ExperimentCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [devices, setDevices] = useState<Device[]>(() => getDefaultTopology(protocol).devices)
  const [connections, setConnections] = useState<Connection[]>(() => getDefaultTopology(protocol).connections)
  const [packets, setPackets] = useState<Packet[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [linkingDevice, setLinkingDevice] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [windowSize, setWindowSize] = useState(config.windowSize || 3)
  const [simulateLoss, setSimulateLoss] = useState(config.simulateLoss || false)
  const [zoom, setZoom] = useState(1)
  const [draggingDevice, setDraggingDevice] = useState<string | null>(null)

  // 优化后的拖拽状态 - 使用更精确的鼠标追踪
  const dragState = useRef<{
    isDragging: boolean
    deviceId: string | null
    startX: number
    startY: number
    initialDeviceX: number
    initialDeviceY: number
    lastX: number
    lastY: number
    velocity: { x: number; y: number }
  }>({
    isDragging: false,
    deviceId: null,
    startX: 0,
    startY: 0,
    initialDeviceX: 0,
    initialDeviceY: 0,
    lastX: 0,
    lastY: 0,
    velocity: { x: 0, y: 0 }
  })

  // 动画循环 - 用于平滑动画
  useEffect(() => {
    if (!isRunning) return
    let animationFrameId: number
    const animate = () => {
      setPackets((prev) =>
        prev
          .map((packet) => ({
            ...packet,
            currentProgress: packet.currentProgress + packet.speed * 0.02,
          }))
          .filter((packet) => packet.currentProgress < 1)
      )
      animationFrameId = requestAnimationFrame(animate)
    }
    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isRunning])

  // 发送数据包
  const sendPacket = useCallback((sourceId: string, destinationId: string, packetData: any) => {
    setPackets((prev) => [
      ...prev,
      {
        id: `packet-${Date.now()}`,
        protocol,
        data: packetData,
        source: sourceId,
        destination: destinationId,
        currentProgress: 0,
        speed: 0.5,
      },
    ])
  }, [protocol])

  // 开始实验
  const handleStartExperiment = useCallback(() => {
    setIsRunning(true)
    if (protocol === 'tcp') {
      setTimeout(() => sendPacket('client1', 'server1', { type: 'SYN', seq: 0 }), 500)
      setTimeout(() => sendPacket('server1', 'client1', { type: 'SYN-ACK', seq: 0, ack: 1 }), 1000)
      setTimeout(() => sendPacket('client1', 'server1', { type: 'ACK', seq: 1, ack: 1 }), 1500)
    }
  }, [protocol, sendPacket])

  // 停止实验
  const handleStopExperiment = useCallback(() => {
    setIsRunning(false)
    setPackets([])
  }, [])

  // 重置实验
  const handleReset = useCallback(() => {
    setIsRunning(false)
    setPackets([])
    const topology = getDefaultTopology(protocol)
    setDevices(topology.devices)
    setConnections(topology.connections)
    setSelectedDevice(null)
    setLinkingDevice(null)
    setDraggingDevice(null)
  }, [protocol])

  // 添加设备
  const handleAddDevice = useCallback((type: DeviceType) => {
    const newDevice: Device = {
      id: `${type}-${Date.now()}`,
      type,
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 100,
      config: {
        name: `${DEVICE_CONFIG[type].label} ${devices.filter((d) => d.type === type).length + 1}`,
        ip: `192.168.1.${10 + devices.length}`,
        mac: `00:1A:2B:3C:4D:${(50 + devices.length).toString(16).toUpperCase()}`,
      },
    }
    setDevices((prev) => [...prev, newDevice])
  }, [devices])

  // 处理鼠标按下 - 优化后的拖拽启动
  const handleDeviceMouseDown = useCallback((deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const device = devices.find(d => d.id === deviceId)
    if (!device) return

    // 初始化拖拽状态
    dragState.current = {
      isDragging: true,
      deviceId,
      startX: e.clientX,
      startY: e.clientY,
      initialDeviceX: device.x,
      initialDeviceY: device.y,
      lastX: e.clientX,
      lastY: e.clientY,
      velocity: { x: 0, y: 0 }
    }

    // 设置拖拽状态用于视觉反馈
    setDraggingDevice(deviceId)
    setSelectedDevice(deviceId)
  }, [devices])

  // 全局鼠标事件 - 优化后的流畅拖拽
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.isDragging || !dragState.current.deviceId || !canvasRef.current) return

      const canvas = canvasRef.current
      const canvasRect = canvas.getBoundingClientRect()
      const scale = zoom

      // 计算鼠标移动速度（用于惯性效果）
      const deltaX = e.clientX - dragState.current.lastX
      const deltaY = e.clientY - dragState.current.lastY
      dragState.current.lastX = e.clientX
      dragState.current.lastY = e.clientY
      dragState.current.velocity = {
        x: deltaX * 0.15,
        y: deltaY * 0.15
      }

      // 计算新位置（相对于画布，考虑偏移量）
      const currentMouseX = (e.clientX - canvasRect.left) / scale
      const currentMouseY = (e.clientY - canvasRect.top) / scale

      const newX = currentMouseX - (dragState.current.startX - canvasRect.left) / scale + dragState.current.initialDeviceX
      const newY = currentMouseY - (dragState.current.startY - canvasRect.top) / scale + dragState.current.initialDeviceY

      // 边界限制（带弹性效果）
      const boundedX = Math.max(-50, Math.min(newX, (canvasRect.width / scale) - 50))
      const boundedY = Math.max(-50, Math.min(newY, (canvasRect.height / scale) - 50))

      setDevices((prev) =>
        prev.map((d) =>
          d.id === dragState.current.deviceId
            ? { ...d, x: boundedX, y: boundedY }
            : d
        )
      )
    }

    const handleMouseUp = () => {
      if (dragState.current.isDragging) {
        // 添加轻微的惯性效果
        setTimeout(() => {
          setDraggingDevice(null)
        }, 100)
      }
      dragState.current = {
        isDragging: false,
        deviceId: null,
        startX: 0,
        startY: 0,
        initialDeviceX: 0,
        initialDeviceY: 0,
        lastX: 0,
        lastY: 0,
        velocity: { x: 0, y: 0 }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [zoom])

  // 开始连线
  const handleStartLinking = useCallback((deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLinkingDevice(deviceId)
    message.info('点击另一个设备完成连接', 2)
  }, [])

  // 完成连线
  const handleCompleteLink = useCallback((targetDeviceId: string) => {
    if (!linkingDevice || linkingDevice === targetDeviceId) return

    // 检查是否已存在连接
    const exists = connections.some(
      (c) =>
        (c.source === linkingDevice && c.destination === targetDeviceId) ||
        (c.source === targetDeviceId && c.destination === linkingDevice)
    )

    if (exists) {
      message.warning('这两个设备已经连接过了')
      setLinkingDevice(null)
      return
    }

    setConnections((prev) => [
      ...prev,
      {
        id: `conn-${Date.now()}`,
        source: linkingDevice,
        destination: targetDeviceId,
        status: 'active',
      },
    ])
    setLinkingDevice(null)
    message.success('连接已创建')
  }, [linkingDevice, connections])

  // 取消连线模式
  const handleCancelLinking = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setLinkingDevice(null)
  }, [])

  // 删除设备
  const handleDeleteDevice = useCallback(() => {
    if (!selectedDevice) return
    setDevices((prev) => prev.filter((d) => d.id !== selectedDevice))
    setConnections((prev) =>
      prev.filter((c) => c.source !== selectedDevice && c.destination !== selectedDevice)
    )
    setSelectedDevice(null)
    setLinkingDevice(null)
    message.success('设备已删除')
  }, [selectedDevice])

  // 更新设备配置
  const handleDeviceConfigChange = useCallback((field: string, value: string) => {
    if (!selectedDevice) return
    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedDevice ? { ...d, config: { ...d.config, [field]: value } } : d
      )
    )
  }, [selectedDevice])

  // 处理设备点击
  const handleDeviceClick = useCallback((e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation()

    // 如果正在连线中
    if (linkingDevice && linkingDevice !== deviceId) {
      handleCompleteLink(deviceId)
      return
    }

    // 如果不是拖拽
    if (!dragState.current.isDragging && !draggingDevice) {
      setSelectedDevice(deviceId === selectedDevice ? null : deviceId)
    }
  }, [linkingDevice, selectedDevice, draggingDevice, handleCompleteLink])

  // 画布点击事件 - 取消选择
  const handleCanvasClick = useCallback(() => {
    if (linkingDevice) {
      setLinkingDevice(null)
    } else if (!dragState.current.isDragging && !draggingDevice) {
      setSelectedDevice(null)
    }
  }, [linkingDevice, draggingDevice])

  const selectedDeviceInfo = devices.find((d) => d.id === selectedDevice)

  return (
    <div className="experiment-canvas lab-style">
      {/* 主画布区域 */}
      <div className="canvas-main">
        {/* 左上角工具栏 */}
        <div className="canvas-toolbar">
          <Space size="small">
            <Button
              className="toolbar-btn back-btn"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              size="small"
            >
              返回
            </Button>
            <Button
              className="toolbar-btn"
              type={isRunning ? 'default' : 'primary'}
              icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={isRunning ? handleStopExperiment : handleStartExperiment}
              size="small"
            >
              {isRunning ? '停止' : '开始'}
            </Button>
            <Button
              className="toolbar-btn"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              size="small"
            >
              重置
            </Button>
          </Space>
        </div>
        {/* 左侧设备库 */}
        <div className="device-library lab-glass">
          <Title level={5}>设备库</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {(Object.keys(DEVICE_CONFIG) as DeviceType[]).map((type) => {
              const Config = DEVICE_CONFIG[type]
              return (
                <Tooltip key={type} title={`添加${Config.label}`} placement="right">
                  <Button
                    icon={<Config.icon />}
                    onClick={() => handleAddDevice(type)}
                    block
                    size="small"
                    className="lab-device-btn"
                  >
                    {Config.label}
                  </Button>
                </Tooltip>
              )
            })}
          </Space>
          <div className="library-tips">
            <p>📦 点击添加设备</p>
            <p>✋ 拖拽调整位置</p>
            <p>🔗 点击 + 号连线</p>
          </div>
        </div>

        {/* 中央画布 */}
        <div className="canvas-viewport lab-viewport" ref={canvasRef} onClick={handleCanvasClick}>
          {/* 动态网格背景 */}
          <div className="lab-grid-overlay"></div>
          <div className="lab-grid-glow"></div>

          <div className="canvas-grid" style={{ transform: `scale(${zoom})` }}>
            {/* 连线层 */}
            <svg className="connection-layer">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#30D158" />
                </marker>
                {/* 发光效果 */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {connections.map((conn) => {
                const source = devices.find((d) => d.id === conn.source)
                const dest = devices.find((d) => d.id === conn.destination)
                if (!source || !dest) return null
                return (
                  <g key={conn.id}>
                    {/* 外发光层 */}
                    <line
                      x1={source.x + 24}
                      y1={source.y + 24}
                      x2={dest.x + 24}
                      y2={dest.y + 24}
                      stroke={conn.status === 'active' ? '#30D158' : '#FF3B30'}
                      strokeWidth={6}
                      strokeDasharray={conn.status === 'active' ? 'none' : '5,5'}
                      opacity={0.3}
                      filter="url(#glow)"
                    />
                    {/* 内层实线 */}
                    <line
                      x1={source.x + 24}
                      y1={source.y + 24}
                      x2={dest.x + 24}
                      y2={dest.y + 24}
                      stroke={conn.status === 'active' ? '#30D158' : '#FF3B30'}
                      strokeWidth={2}
                      strokeDasharray={conn.status === 'active' ? 'none' : '5,5'}
                      markerEnd="url(#arrowhead)"
                      className="connection-path"
                    />
                  </g>
                )
              })}
              {/* 正在连线时的临时线 */}
              {linkingDevice && (() => {
                const linkingDev = devices.find((d) => d.id === linkingDevice)
                const devX = linkingDev?.x ?? 0
                const devY = linkingDev?.y ?? 0
                return (
                  <line
                    x1={devX + 24}
                    y1={devY + 24}
                    x2={devX + 24}
                    y2={devY + 24}
                    stroke="#007AFF"
                    strokeWidth={3}
                    strokeDasharray="5,5"
                    className="linking-preview"
                    filter="url(#glow)"
                  />
                )
              })()}
            </svg>

            {/* 设备层 */}
            {devices.map((device) => {
              const DeviceConfig = DEVICE_CONFIG[device.type]
              const isLinking = linkingDevice === device.id
              const isSelected = selectedDevice === device.id
              const isDragging = draggingDevice === device.id

              return (
                <div
                  key={device.id}
                  className={`device-node lab-device ${isSelected ? 'selected' : ''} ${isLinking ? 'linking' : ''} ${isDragging ? 'dragging' : ''}`}
                  style={{
                    left: device.x,
                    top: device.y,
                    '--device-color': DeviceConfig.color,
                    '--port-color': DeviceConfig.portColor,
                  } as React.CSSProperties}
                  onMouseDown={(e) => handleDeviceMouseDown(device.id, e)}
                  onClick={(e) => handleDeviceClick(e, device.id)}
                >
                  {/* 连接端口 - 实验室风格 */}
                  <div className="lab-ports">
                    <div className="port port-north"></div>
                    <div className="port port-east"></div>
                    <div className="port port-south"></div>
                    <div className="port port-west"></div>
                  </div>

                  {/* 设备主体 */}
                  <div className="device-icon lab-device-icon" style={{ background: `linear-gradient(135deg, ${DeviceConfig.color}, ${DeviceConfig.color}dd)` }}>
                    <DeviceConfig.icon />
                    {/* 设备光晕 */}
                    <div className="lab-device-glow"></div>
                  </div>
                  <div className="device-info">
                    <div className="device-name">{device.config.name}</div>
                    {device.config.ip && <div className="device-ip">{device.config.ip}</div>}
                  </div>

                  {/* 状态指示器 */}
                  <div className="lab-status-indicator"></div>

                  {/* 连线按钮 - 选中时显示 */}
                  {isSelected && !linkingDevice && (
                    <button
                      className="device-link-btn lab-link-btn"
                      onClick={(e) => handleStartLinking(device.id, e)}
                      title="连接到其他设备"
                    >
                      <LinkOutlined />
                    </button>
                  )}

                  {/* 取消连线按钮 */}
                  {isLinking && (
                    <button
                      className="device-cancel-link-btn"
                      onClick={handleCancelLinking}
                      title="取消连线"
                    >
                      <CloseOutlined />
                    </button>
                  )}
                </div>
              )
            })}

            {/* 数据包动画层 */}
            {packets.map((packet) => {
              const source = devices.find((d) => d.id === packet.source)
              const dest = devices.find((d) => d.id === packet.destination)
              if (!source || !dest) return null

              const currentX = (source.x + 24) + ((dest.x + 24) - (source.x + 24)) * packet.currentProgress
              const currentY = (source.y + 24) + ((dest.y + 24) - (source.y + 24)) * packet.currentProgress

              return (
                <div
                  key={packet.id}
                  className="packet-animation lab-packet"
                  style={{
                    left: currentX,
                    top: currentY,
                    '--packet-color': packet.protocol === 'tcp' ? '#007AFF' : packet.protocol === 'udp' ? '#FF9500' : '#30D158',
                  } as React.CSSProperties}
                >
                  <div className="packet-body"></div>
                  <div className="packet-label">{packet.data.type || packet.protocol.toUpperCase()}</div>
                  {/* 数据包尾迹 */}
                  <div className="packet-trail"></div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 右侧配置面板 */}
        <div className="config-panel lab-glass">
          <Title level={5}>
            <SettingOutlined /> 实验配置
          </Title>

          {selectedDeviceInfo ? (
            <div className="device-config">
              <Tag color="blue">{selectedDeviceInfo.type.toUpperCase()}</Tag>
              <div className="config-item">
                <label>名称</label>
                <input
                  type="text"
                  value={selectedDeviceInfo.config.name}
                  onChange={(e) => handleDeviceConfigChange('name', e.target.value)}
                />
              </div>
              <div className="config-item">
                <label>IP 地址</label>
                <input
                  type="text"
                  value={selectedDeviceInfo.config.ip || ''}
                  onChange={(e) => handleDeviceConfigChange('ip', e.target.value)}
                />
              </div>
              <div className="config-item">
                <label>MAC 地址</label>
                <input
                  type="text"
                  value={selectedDeviceInfo.config.mac || ''}
                  onChange={(e) => handleDeviceConfigChange('mac', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="experiment-config">
              {protocol === 'tcp' && (
                <>
                  <div className="config-item">
                    <label>发送窗口大小：{windowSize}</label>
                    <Slider
                      min={1}
                      max={10}
                      value={windowSize}
                      onChange={setWindowSize}
                      tooltip={{ open: false }}
                    />
                  </div>
                  <div className="config-item">
                    <label>模拟丢包</label>
                    <Switch checked={simulateLoss} onChange={setSimulateLoss} size="small" />
                  </div>
                </>
              )}
              {protocol === 'udp' && (
                <>
                  <div className="config-item">
                    <label>MTU: {config.mtu || 1500} B</label>
                    <Slider min={500} max={9000} step={100} value={config.mtu || 1500} onChange={() => { }} tooltip={{ open: false }} />
                  </div>
                  <div className="config-item">
                    <label>模拟丢包</label>
                    <Switch checked={simulateLoss} onChange={setSimulateLoss} size="small" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="panel-actions">
            {linkingDevice ? (
              <Button
                danger
                block
                onClick={() => setLinkingDevice(null)}
              >
                <CloseOutlined /> 取消连线模式
              </Button>
            ) : (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteDevice}
                disabled={!selectedDevice}
                block
              >
                删除设备
              </Button>
            )}
          </div>

          {/* 缩放控制 */}
          <div className="zoom-control">
            <label>缩放：{Math.round(zoom * 100)}%</label>
            <Slider min={0.5} max={2} step={0.1} value={zoom} onChange={setZoom} tooltip={{ open: false }} />
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="canvas-status lab-status">
        <span>设备：{devices.length}</span>
        <span>连接：{connections.length}</span>
        <span>数据包：{packets.length}</span>
        <Tag color={isRunning ? 'green' : 'default'}>{isRunning ? '运行中' : '已停止'}</Tag>
        {linkingDevice && <Tag color="blue">连线中...</Tag>}
      </div>
    </div>
  )
}
