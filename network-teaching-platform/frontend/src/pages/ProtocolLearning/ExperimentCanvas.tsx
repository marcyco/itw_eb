/**
 * 实验画布组件 - 优化版
 * 拖拽设备后显示连接按钮，点击 + 号选择连线模式
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
  PlusOutlined,
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
const DEVICE_CONFIG: Record<DeviceType, { icon: any; color: string; label: string }> = {
  host: { icon: DesktopOutlined, color: '#007AFF', label: '主机' },
  router: { icon: ApartmentOutlined, color: '#FF9500', label: '路由器' },
  switch: { icon: SwapOutlined, color: '#30D158', label: '交换机' },
  cloud: { icon: CloudOutlined, color: '#BF5AF2', label: '云' },
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

  // 拖拽状态
  const dragState = useRef<{
    isDragging: boolean
    deviceId: string | null
    offsetX: number
    offsetY: number
  }>({ isDragging: false, deviceId: null, offsetX: 0, offsetY: 0 })

  // 动画循环
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

  // 处理鼠标按下 - 记录初始位置
  const handleDeviceMouseDown = useCallback((deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const device = devices.find(d => d.id === deviceId)
    if (!device) return

    // 记录设备当前位置和鼠标偏移
    dragState.current = {
      isDragging: true,
      deviceId,
      offsetX: e.clientX - device.x,
      offsetY: e.clientY - device.y,
    }
  }, [devices])

  // 全局鼠标事件 - 处理拖拽
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.isDragging || !dragState.current.deviceId || !canvasRef.current) return

      const canvas = canvasRef.current
      const canvasRect = canvas.getBoundingClientRect()
      const scale = zoom

      // 计算新位置（相对于画布）
      const newX = (e.clientX - canvasRect.left - dragState.current.offsetX) / scale
      const newY = (e.clientY - canvasRect.top - dragState.current.offsetY) / scale

      setDevices((prev) =>
        prev.map((d) =>
          d.id === dragState.current.deviceId
            ? { ...d, x: Math.max(0, newX), y: Math.max(0, newY) }
            : d
        )
      )
    }

    const handleMouseUp = () => {
      dragState.current = { isDragging: false, deviceId: null, offsetX: 0, offsetY: 0 }
    }

    if (dragState.current.isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

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

    // 如果不是拖拽（鼠标按下和抬起位置相同）
    if (!dragState.current.isDragging) {
      setSelectedDevice(deviceId === selectedDevice ? null : deviceId)
    }
  }, [linkingDevice, selectedDevice, handleCompleteLink])

  // 画布点击事件 - 取消选择
  const handleCanvasClick = useCallback(() => {
    if (linkingDevice) {
      setLinkingDevice(null)
    } else if (!dragState.current.isDragging) {
      setSelectedDevice(null)
    }
  }, [linkingDevice])

  const selectedDeviceInfo = devices.find((d) => d.id === selectedDevice)

  return (
    <div className="experiment-canvas">
      {/* 顶部工具栏 */}
      <div className="canvas-header">
        <Button className="back-btn" icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回
        </Button>
        <Title level={4} style={{ margin: 0 }}>{protocol.toUpperCase()} 实验</Title>
        <Space>
          <Button
            type={isRunning ? 'default' : 'primary'}
            icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={isRunning ? handleStopExperiment : handleStartExperiment}
          >
            {isRunning ? '停止' : '开始'}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </div>

      {/* 主画布区域 */}
      <div className="canvas-main">
        {/* 左侧设备库 */}
        <div className="device-library glass">
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
        <div className="canvas-viewport" ref={canvasRef} onClick={handleCanvasClick}>
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
              </defs>
              {connections.map((conn) => {
                const source = devices.find((d) => d.id === conn.source)
                const dest = devices.find((d) => d.id === conn.destination)
                if (!source || !dest) return null
                return (
                  <line
                    key={conn.id}
                    x1={source.x + 24}
                    y1={source.y + 24}
                    x2={dest.x + 24}
                    y2={dest.y + 24}
                    stroke={conn.status === 'active' ? '#30D158' : '#FF3B30'}
                    strokeWidth={3}
                    strokeDasharray={conn.status === 'active' ? 'none' : '5,5'}
                    markerEnd="url(#arrowhead)"
                    className="connection-path"
                  />
                )
              })}
              {/* 正在连线时的临时线 */}
              {linkingDevice && (
                <line
                  x1={devices.find((d) => d.id === linkingDevice)?.x + 24 || 0}
                  y1={devices.find((d) => d.id === linkingDevice)?.y + 24 || 0}
                  x2={devices.find((d) => d.id === linkingDevice)?.x + 24 || 0}
                  y2={devices.find((d) => d.id === linkingDevice)?.y + 24 || 0}
                  stroke="#007AFF"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                  className="linking-preview"
                />
              )}
            </svg>

            {/* 设备层 */}
            {devices.map((device) => {
              const DeviceConfig = DEVICE_CONFIG[device.type]
              const isLinking = linkingDevice === device.id
              const isSelected = selectedDevice === device.id

              return (
                <div
                  key={device.id}
                  className={`device-node ${isSelected ? 'selected' : ''} ${isLinking ? 'linking' : ''}`}
                  style={{
                    left: device.x,
                    top: device.y,
                    '--device-color': DeviceConfig.color,
                  } as React.CSSProperties}
                  onMouseDown={(e) => handleDeviceMouseDown(device.id, e)}
                  onClick={(e) => handleDeviceClick(e, device.id)}
                  onMouseUp={() => {
                    // 重置拖拽标志
                    if (dragState.current.deviceId === device.id) {
                      setTimeout(() => {
                        dragState.current.isDragging = false
                      }, 50)
                    }
                  }}
                >
                  {/* 设备主体 */}
                  <div className="device-icon" style={{ background: DeviceConfig.color }}>
                    <DeviceConfig.icon />
                  </div>
                  <div className="device-info">
                    <div className="device-name">{device.config.name}</div>
                    {device.config.ip && <div className="device-ip">{device.config.ip}</div>}
                  </div>

                  {/* 连线按钮 - 选中时显示 */}
                  {isSelected && !linkingDevice && (
                    <button
                      className="device-link-btn"
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
                  className="packet-animation"
                  style={{
                    left: currentX,
                    top: currentY,
                    '--packet-color': packet.protocol === 'tcp' ? '#007AFF' : packet.protocol === 'udp' ? '#FF9500' : '#30D158',
                  } as React.CSSProperties}
                >
                  <div className="packet-body"></div>
                  <div className="packet-label">{packet.data.type || packet.protocol.toUpperCase()}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 右侧配置面板 */}
        <div className="config-panel glass">
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
      <div className="canvas-status">
        <span>设备：{devices.length}</span>
        <span>连接：{connections.length}</span>
        <span>数据包：{packets.length}</span>
        <Tag color={isRunning ? 'green' : 'default'}>{isRunning ? '运行中' : '已停止'}</Tag>
        {linkingDevice && <Tag color="blue">连线中...</Tag>}
      </div>
    </div>
  )
}
