/**
 * 自由实验室 - 增强版拖拽和画布功能
 * 流畅拖拽 + 智能连线 + 端口检测
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, Slider, Space, Typography, Tooltip, message } from 'antd'
import {
  DesktopOutlined,
  ApartmentOutlined,
  SwapOutlined,
  CloudOutlined,
  CloseOutlined,
  DeleteOutlined,
  SettingOutlined,
  UndoOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './index.css'

const { Title } = Typography

export type DeviceType = 'host' | 'router' | 'switch' | 'cloud'
export type PortType = 'eth0' | 'eth1' | 'eth2' | 'eth3' | 's0/0/0' | 's0/0/1'

export interface Port {
  id: string
  name: string
  type: PortType
  connected?: boolean
  x: number
  y: number
}

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
  ports: Port[]
}

export interface Connection {
  id: string
  sourceDevice: string
  sourcePort: string
  destDevice: string
  destPort: string
  status: 'active' | 'inactive'
  path?: { x: number; y: number }[]
}

// 设备类型配置
const DEVICE_CONFIG: Record<DeviceType, { icon: any; color: string; label: string; portCount: number; portType: PortType[] }> = {
  host: { icon: DesktopOutlined, color: '#007AFF', label: '主机', portCount: 2, portType: ['eth0', 'eth1'] },
  router: { icon: ApartmentOutlined, color: '#FF9500', label: '路由器', portCount: 4, portType: ['eth0', 'eth1', 's0/0/0', 's0/0/1'] },
  switch: { icon: SwapOutlined, color: '#30D158', label: '交换机', portCount: 4, portType: ['eth0', 'eth1', 'eth2', 'eth3'] },
  cloud: { icon: CloudOutlined, color: '#BF5AF2', label: '云', portCount: 2, portType: ['eth0', 'eth1'] },
}

// 生成端口
const generatePorts = (type: DeviceType, deviceId: string): Port[] => {
  const config = DEVICE_CONFIG[type]
  const positions: Record<number, { x: number; y: number }> = {
    0: { x: 30, y: -8 },   // top
    1: { x: 68, y: 30 },   // right
    2: { x: 30, y: 68 },   // bottom
    3: { x: -8, y: 30 },   // left
  }

  return config.portType.map((portType, index) => ({
    id: `${deviceId}-port-${portType}`,
    name: portType,
    type: portType,
    connected: false,
    ...positions[index % 4],
  }))
}

export default function FreeLabPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [_selectedPort, setSelectedPort] = useState<string | null>(null)
  const [linkingMode, setLinkingMode] = useState(false)
  const [linkingSource, setLinkingSource] = useState<{ deviceId: string; portId: string } | null>(null)
  const [draggingDevice, setDraggingDevice] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [tempLine, setTempLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)

  // 拖拽状态 - 增强版
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
    startTime: number
  }>({
    isDragging: false,
    deviceId: null,
    startX: 0,
    startY: 0,
    initialDeviceX: 0,
    initialDeviceY: 0,
    lastX: 0,
    lastY: 0,
    velocity: { x: 0, y: 0 },
    startTime: 0,
  })

  // 惯性动画
  const inertiaRef = useRef<number | null>(null)

  // 添加设备
  const handleAddDevice = useCallback((type: DeviceType) => {
    const deviceId = `${type}-${Date.now()}`
    const newDevice: Device = {
      id: deviceId,
      type,
      x: 150 + Math.random() * 300,
      y: 150 + Math.random() * 200,
      config: {
        name: `${DEVICE_CONFIG[type].label} ${devices.filter((d) => d.type === type).length + 1}`,
        ip: `192.168.1.${10 + devices.length}`,
        mac: `00:1A:2B:3C:4D:${(50 + devices.length).toString(16).toUpperCase()}`,
      },
      ports: generatePorts(type, deviceId),
    }
    setDevices((prev) => [...prev, newDevice])
    message.success(`已添加${DEVICE_CONFIG[type].label}`)
  }, [devices])

  // 设备鼠标按下 - 增强拖拽
  const handleDeviceMouseDown = useCallback((deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const device = devices.find((d) => d.id === deviceId)
    if (!device) return

    dragState.current = {
      isDragging: true,
      deviceId,
      startX: e.clientX,
      startY: e.clientY,
      initialDeviceX: device.x,
      initialDeviceY: device.y,
      lastX: e.clientX,
      lastY: e.clientY,
      velocity: { x: 0, y: 0 },
      startTime: Date.now(),
    }

    setDraggingDevice(deviceId)
    setSelectedDevice(deviceId)
  }, [devices])

  // 端口鼠标按下 - 开始连线
  const handlePortMouseDown = useCallback((deviceId: string, portId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const device = devices.find(d => d.id === deviceId)
    const port = device?.ports.find(p => p.id === portId)

    if (!port) return

    if (port.connected) {
      message.warning('此端口已连接')
      return
    }

    setLinkingMode(true)
    setLinkingSource({ deviceId, portId })

    // 获取端口绝对位置
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (canvasRect && device) {
      setTempLine({
        x1: (device.x + port.x) * zoom,
        y1: (device.y + port.y) * zoom,
        x2: (e.clientX - canvasRect.left) / zoom,
        y2: (e.clientY - canvasRect.top) / zoom,
      })
    }
  }, [devices, zoom])

  // 全局鼠标移动 - 增强拖拽 + 临时连线
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 拖拽处理
      if (dragState.current.isDragging && dragState.current.deviceId && canvasRef.current) {
        const canvas = canvasRef.current
        const canvasRect = canvas.getBoundingClientRect()
        const scale = zoom

        // 计算速度（用于惯性）
        const deltaTime = Date.now() - dragState.current.startTime
        if (deltaTime > 0) {
          dragState.current.velocity = {
            x: (e.clientX - dragState.current.lastX) * 0.2,
            y: (e.clientY - dragState.current.lastY) * 0.2,
          }
        }

        const currentMouseX = (e.clientX - canvasRect.left) / scale
        const currentMouseY = (e.clientY - canvasRect.top) / scale

        const newX = currentMouseX - (dragState.current.startX - canvasRect.left) / scale + dragState.current.initialDeviceX
        const newY = currentMouseY - (dragState.current.startY - canvasRect.top) / scale + dragState.current.initialDeviceY

        // 边界限制（带弹性）
        const boundedX = Math.max(10, Math.min(newX, (canvasRect.width / scale) - 70))
        const boundedY = Math.max(10, Math.min(newY, (canvasRect.height / scale) - 70))

        setDevices((prev) =>
          prev.map((d) =>
            d.id === dragState.current.deviceId
              ? { ...d, x: boundedX, y: boundedY }
              : d
          )
        )

        dragState.current.lastX = e.clientX
        dragState.current.lastY = e.clientY
      }

      // 临时连线处理
      if (linkingMode && linkingSource && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const device = devices.find(d => d.id === linkingSource.deviceId)
        const port = device?.ports.find(p => p.id === linkingSource.portId)

        if (device && port) {
          setTempLine({
            x1: device.x + port.x + 30,
            y1: device.y + port.y + 30,
            x2: (e.clientX - canvasRect.left) / zoom,
            y2: (e.clientY - canvasRect.top) / zoom,
          })
        }
      }
    }

    const handleMouseUp = () => {
      // 停止拖拽 - 添加惯性效果
      if (dragState.current.isDragging && dragState.current.deviceId) {
        const velocity = dragState.current.velocity
        const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)

        if (speed > 0.5) {
          // 有足够速度时添加惯性
          let inertiaSteps = 0
          const maxSteps = Math.min(20, speed * 10)

          const applyInertia = () => {
            if (inertiaSteps >= maxSteps) {
              if (inertiaRef.current) {
                cancelAnimationFrame(inertiaRef.current)
                inertiaRef.current = null
              }
              return
            }

            const decay = 0.85
            setDevices((prev) =>
              prev.map((d) => {
                if (d.id === dragState.current.deviceId) {
                  return {
                    ...d,
                    x: d.x + velocity.x * Math.pow(decay, inertiaSteps),
                    y: d.y + velocity.y * Math.pow(decay, inertiaSteps),
                  }
                }
                return d
              })
            )

            inertiaSteps++
            inertiaRef.current = requestAnimationFrame(applyInertia)
          }

          inertiaRef.current = requestAnimationFrame(applyInertia)
        }
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
        velocity: { x: 0, y: 0 },
        startTime: 0,
      }
      setDraggingDevice(null)
      setTempLine(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      if (inertiaRef.current) {
        cancelAnimationFrame(inertiaRef.current)
      }
    }
  }, [zoom, linkingMode, linkingSource, devices])

  // 端口鼠标松开 - 完成连线
  const handlePortMouseUp = useCallback((deviceId: string, portId: string) => {
    if (!linkingMode || !linkingSource) return

    // 不能连接到自己
    if (linkingSource.deviceId === deviceId) {
      message.warning('不能连接到同一设备')
      setLinkingMode(false)
      setLinkingSource(null)
      setTempLine(null)
      return
    }

    // 检查是否已存在连接
    const exists = connections.some(
      (c) =>
        (c.sourceDevice === linkingSource.deviceId && c.destDevice === deviceId) ||
        (c.sourceDevice === deviceId && c.destDevice === linkingSource.deviceId)
    )

    if (exists) {
      message.warning('这两个设备已经连接过了')
      setLinkingMode(false)
      setLinkingSource(null)
      setTempLine(null)
      return
    }

    // 创建连接
    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      sourceDevice: linkingSource.deviceId,
      sourcePort: linkingSource.portId,
      destDevice: deviceId,
      destPort: portId,
      status: 'active',
    }

    setConnections((prev) => [...prev, newConnection])
    setLinkingMode(false)
    setLinkingSource(null)
    setTempLine(null)
    message.success('连接已创建')
  }, [linkingMode, linkingSource, connections])

  // 取消连线模式
  const handleCancelLinking = useCallback(() => {
    setLinkingMode(false)
    setLinkingSource(null)
    setTempLine(null)
  }, [])

  // 删除设备
  const handleDeleteDevice = useCallback(() => {
    if (!selectedDevice) return
    setDevices((prev) => prev.filter((d) => d.id !== selectedDevice))
    setConnections((prev) =>
      prev.filter((c) => c.sourceDevice !== selectedDevice && c.destDevice !== selectedDevice)
    )
    setSelectedDevice(null)
    setSelectedPort(null)
    message.success('设备已删除')
  }, [selectedDevice])

  // 设备点击
  const handleDeviceClick = useCallback((e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation()
    if (!linkingMode) {
      setSelectedDevice(deviceId === selectedDevice ? null : deviceId)
      setSelectedPort(null)
    }
  }, [linkingMode, selectedDevice])

  // 画布点击
  const handleCanvasClick = useCallback(() => {
    if (linkingMode) {
      handleCancelLinking()
    } else {
      setSelectedDevice(null)
      setSelectedPort(null)
    }
  }, [linkingMode, handleCancelLinking])

  // 更新设备配置
  const handleDeviceConfigChange = useCallback((field: string, value: string) => {
    if (!selectedDevice) return
    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedDevice ? { ...d, config: { ...d.config, [field]: value } } : d
      )
    )
  }, [selectedDevice])

  // 清空画布
  const handleClearCanvas = useCallback(() => {
    setDevices([])
    setConnections([])
    setSelectedDevice(null)
    setSelectedPort(null)
    setLinkingMode(false)
    setLinkingSource(null)
    message.success('画布已清空')
  }, [])

  // 取消最后一个连接
  const handleUndoLastConnection = useCallback(() => {
    if (connections.length === 0) return
    setConnections((prev) => prev.slice(0, -1))
    message.success('已撤销最后一个连接')
  }, [connections])

  const selectedDeviceInfo = devices.find((d) => d.id === selectedDevice)

  return (
    <div className="freelab-page-wrapper">
      {/* 顶部工具栏 */}
      <div className="freelab-toolbar">
        <Space size="small">
          <Button
            className="toolbar-btn back-btn"
            onClick={() => navigate('/')}
            icon={<ArrowLeftOutlined />}
            size="small"
          >
            返回
          </Button>
          <Button
            className="toolbar-btn primary"
            onClick={() => handleAddDevice('host')}
            icon={<DesktopOutlined />}
            size="small"
          >
            主机
          </Button>
          <Button
            className="toolbar-btn primary"
            onClick={() => handleAddDevice('router')}
            icon={<ApartmentOutlined />}
            size="small"
          >
            路由器
          </Button>
          <Button
            className="toolbar-btn primary"
            onClick={() => handleAddDevice('switch')}
            icon={<SwapOutlined />}
            size="small"
          >
            交换机
          </Button>
          <Button
            className="toolbar-btn primary"
            onClick={() => handleAddDevice('cloud')}
            icon={<CloudOutlined />}
            size="small"
          >
            云
          </Button>
          <Button
            className="toolbar-btn warning"
            onClick={handleUndoLastConnection}
            disabled={connections.length === 0}
            icon={<UndoOutlined />}
            size="small"
          >
            撤销连接
          </Button>
          <Button
            className="toolbar-btn danger"
            onClick={handleClearCanvas}
            icon={<DeleteOutlined />}
            size="small"
          >
            清空
          </Button>
        </Space>

        {linkingMode && (
          <Space size="small" className="linking-hint">
            <span className="hint-text">🔗 连线模式中，点击目标端口完成连接</span>
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={handleCancelLinking}
            >
              取消
            </Button>
          </Space>
        )}
      </div>

      {/* 主画布区域 */}
      <div className="freelab-content">
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
            <p>✋ 拖拽调整位置（支持惯性）</p>
            <p>🔌 点击端口进行连线</p>
            <p>⚡ 智能检测端口状态</p>
          </div>
        </div>

        {/* 中央画布 */}
        <div
          className="canvas-area glass freelab-canvas"
          ref={canvasRef}
          onClick={handleCanvasClick}
        >
          {devices.length === 0 ? (
            <div className="canvas-placeholder">
              <DesktopOutlined style={{ fontSize: 64, opacity: 0.3 }} />
              <p>从左侧添加设备到画布</p>
              <p className="sub">或点击顶部工具栏快速添加</p>
              <p className="sub">点击设备端口开始连线</p>
            </div>
          ) : (
            <>
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
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#007AFF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#30D158" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* 已建立的连接 */}
                {connections.map((conn) => {
                  const source = devices.find((d) => d.id === conn.sourceDevice)
                  const dest = devices.find((d) => d.id === conn.destDevice)
                  const sourcePort = source?.ports.find(p => p.id === conn.sourcePort)
                  const destPort = dest?.ports.find(p => p.id === conn.destPort)

                  if (!source || !dest || !sourcePort || !destPort) return null

                  const x1 = source.x + sourcePort.x + 30
                  const y1 = source.y + sourcePort.y + 30
                  const x2 = dest.x + destPort.x + 30
                  const y2 = dest.y + destPort.y + 30

                  return (
                    <g key={conn.id}>
                      {/* 外发光层 */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={conn.status === 'active' ? '#30D158' : '#FF3B30'}
                        strokeWidth={8}
                        strokeOpacity={0.3}
                        filter="drop-shadow(0 0 8px rgba(48, 209, 88, 0.6))"
                      />
                      {/* 内层实线 */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        markerEnd="url(#arrowhead)"
                        className="connection-path"
                      />
                    </g>
                  )
                })}

                {/* 临时连线（拖拽时） */}
                {tempLine && (
                  <line
                    x1={tempLine.x1}
                    y1={tempLine.y1}
                    x2={tempLine.x2}
                    y2={tempLine.y2}
                    stroke="#007AFF"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                    className="linking-preview"
                    filter="drop-shadow(0 0 4px #007AFF)"
                  />
                )}
              </svg>

              {/* 设备层 */}
              {devices.map((device) => {
                const DeviceConfig = DEVICE_CONFIG[device.type]
                const isSelected = selectedDevice === device.id
                const isDragging = draggingDevice === device.id

                return (
                  <div
                    key={device.id}
                    className={`device-node lab-device ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
                    style={{
                      left: device.x,
                      top: device.y,
                      '--device-color': DeviceConfig.color,
                    } as React.CSSProperties}
                    onMouseDown={(e) => handleDeviceMouseDown(device.id, e)}
                    onClick={(e) => handleDeviceClick(e, device.id)}
                  >
                    {/* 设备主体 */}
                    <div
                      className="device-icon lab-device-icon"
                      style={{ background: `linear-gradient(135deg, ${DeviceConfig.color}, ${DeviceConfig.color}dd)` }}
                    >
                      <DeviceConfig.icon />
                      <div className="lab-device-glow"></div>
                    </div>

                    <div className="device-info">
                      <div className="device-name">{device.config.name}</div>
                      {device.config.ip && <div className="device-ip">{device.config.ip}</div>}
                    </div>

                    {/* 端口层 */}
                    <div className="port-layer">
                      {device.ports.map((port) => {
                        const isConnected = connections.some(
                          c => (c.sourceDevice === device.id && c.sourcePort === port.id) ||
                            (c.destDevice === device.id && c.destPort === port.id)
                        )
                        const isSourcePort = linkingSource?.portId === port.id && linkingSource?.deviceId === device.id

                        return (
                          <div
                            key={port.id}
                            className={`port-node ${isConnected ? 'connected' : ''} ${isSourcePort ? 'source' : ''}`}
                            style={{
                              left: port.x + 30,
                              top: port.y + 30,
                            }}
                            onMouseDown={(e) => handlePortMouseDown(device.id, port.id, e)}
                            onMouseUp={() => handlePortMouseUp(device.id, port.id)}
                          >
                            <div className="port-indicator"></div>
                            <Tooltip title={port.name} placement="top">
                              <div className="port-label">{port.name}</div>
                            </Tooltip>
                          </div>
                        )
                      })}
                    </div>

                    {/* 状态指示器 */}
                    <div className="lab-status-indicator"></div>

                    {/* 删除按钮 */}
                    {isSelected && !linkingMode && (
                      <button
                        className="device-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDevice()
                        }}
                        title="删除设备"
                      >
                        <DeleteOutlined />
                      </button>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* 右侧配置面板 */}
        <div className="config-panel glass">
          <Title level={5}>
            <SettingOutlined /> 配置面板
          </Title>

          {selectedDeviceInfo ? (
            <div className="device-config">
              <div className="config-header">
                <span className="device-type-tag">{DEVICE_CONFIG[selectedDeviceInfo.type].label}</span>
                <span className="device-id">{selectedDeviceInfo.id.slice(-6)}</span>
              </div>

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
                <label>子网掩码</label>
                <input
                  type="text"
                  value={selectedDeviceInfo.config.subnetMask || '255.255.255.0'}
                  onChange={(e) => handleDeviceConfigChange('subnetMask', e.target.value)}
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

              <div className="port-status">
                <label>端口状态</label>
                <div className="port-list">
                  {selectedDeviceInfo.ports.map((port) => {
                    const isConnected = connections.some(
                      c => (c.sourceDevice === selectedDeviceInfo.id && c.sourcePort === port.id) ||
                        (c.destDevice === selectedDeviceInfo.id && c.destPort === port.id)
                    )
                    return (
                      <div key={port.id} className={`port-item ${isConnected ? 'connected' : ''}`}>
                        <span className="port-name">{port.name}</span>
                        <span className={`port-status ${isConnected ? 'active' : 'inactive'}`}>
                          {isConnected ? '●' : '○'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="panel-actions">
                <Button danger block size="small" onClick={handleDeleteDevice} icon={<DeleteOutlined />}>
                  删除设备
                </Button>
              </div>
            </div>
          ) : (
            <div className="config-placeholder">
              <SettingOutlined style={{ fontSize: 48, opacity: 0.3 }} />
              <p>点击设备配置参数</p>
              <p className="sub">IP 地址、子网掩码、网关</p>
              <p className="sub">点击端口开始连线</p>
            </div>
          )}

          {/* 缩放控制 */}
          <div className="zoom-control">
            <label style={{ fontSize: 12, color: 'var(--macos-text-tertiary)' }}>缩放：{zoom * 100}%</label>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={zoom}
              onChange={setZoom}
              tooltip={{ open: false }}
            />
          </div>

          {/* 统计信息 */}
          <div className="stats-panel">
            <div className="stat-item">
              <span className="stat-label">设备数</span>
              <span className="stat-value">{devices.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">连接数</span>
              <span className="stat-value">{connections.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
