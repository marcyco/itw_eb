/**
 * 自由实验室 - 完整拖拽和画布功能
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, Slider, Space, Typography, Tooltip, message } from 'antd'
import {
  DesktopOutlined,
  ApartmentOutlined,
  SwapOutlined,
  CloudOutlined,
  LinkOutlined,
  CloseOutlined,
  DeleteOutlined,
  SettingOutlined,
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
  status: 'active' | 'inactive'
}

// 设备类型配置
const DEVICE_CONFIG: Record<DeviceType, { icon: any; color: string; label: string; portColor: string }> = {
  host: { icon: DesktopOutlined, color: '#007AFF', label: '主机', portColor: '#00D4FF' },
  router: { icon: ApartmentOutlined, color: '#FF9500', label: '路由器', portColor: '#FFD60A' },
  switch: { icon: SwapOutlined, color: '#30D158', label: '交换机', portColor: '#32D74B' },
  cloud: { icon: CloudOutlined, color: '#BF5AF2', label: '云', portColor: '#E0A6FF' },
}

export default function FreeLabPage() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [linkingDevice, setLinkingDevice] = useState<string | null>(null)
  const [draggingDevice, setDraggingDevice] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  // 拖拽状态
  const dragState = useRef<{
    isDragging: boolean
    deviceId: string | null
    startX: number
    startY: number
    initialDeviceX: number
    initialDeviceY: number
    lastX: number
    lastY: number
  }>({
    isDragging: false,
    deviceId: null,
    startX: 0,
    startY: 0,
    initialDeviceX: 0,
    initialDeviceY: 0,
    lastX: 0,
    lastY: 0,
  })

  // 添加设备
  const handleAddDevice = useCallback((type: DeviceType) => {
    const newDevice: Device = {
      id: `${type}-${Date.now()}`,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 100,
      config: {
        name: `${DEVICE_CONFIG[type].label} ${devices.filter((d) => d.type === type).length + 1}`,
        ip: `192.168.1.${10 + devices.length}`,
        mac: `00:1A:2B:3C:4D:${(50 + devices.length).toString(16).toUpperCase()}`,
      },
    }
    setDevices((prev) => [...prev, newDevice])
  }, [devices])

  // 设备鼠标按下
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
    }

    setDraggingDevice(deviceId)
    setSelectedDevice(deviceId)
  }, [devices])

  // 全局鼠标事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.isDragging || !dragState.current.deviceId || !canvasRef.current) return

      const canvas = canvasRef.current
      const canvasRect = canvas.getBoundingClientRect()
      const scale = zoom

      const currentMouseX = (e.clientX - canvasRect.left) / scale
      const currentMouseY = (e.clientY - canvasRect.top) / scale

      const newX = currentMouseX - (dragState.current.startX - canvasRect.left) / scale + dragState.current.initialDeviceX
      const newY = currentMouseY - (dragState.current.startY - canvasRect.top) / scale + dragState.current.initialDeviceY

      const boundedX = Math.max(0, Math.min(newX, (canvasRect.width / scale) - 60))
      const boundedY = Math.max(0, Math.min(newY, (canvasRect.height / scale) - 60))

      setDevices((prev) =>
        prev.map((d) =>
          d.id === dragState.current.deviceId
            ? { ...d, x: boundedX, y: boundedY }
            : d
        )
      )
    }

    const handleMouseUp = () => {
      dragState.current = {
        isDragging: false,
        deviceId: null,
        startX: 0,
        startY: 0,
        initialDeviceX: 0,
        initialDeviceY: 0,
        lastX: 0,
        lastY: 0,
      }
      setDraggingDevice(null)
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

  // 取消连线
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
    message.success('设备已删除')
  }, [selectedDevice])

  // 设备点击
  const handleDeviceClick = useCallback((e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation()
    if (linkingDevice && linkingDevice !== deviceId) {
      handleCompleteLink(deviceId)
      return
    }
    if (!dragState.current.isDragging && !draggingDevice) {
      setSelectedDevice(deviceId === selectedDevice ? null : deviceId)
    }
  }, [linkingDevice, selectedDevice, draggingDevice, handleCompleteLink])

  // 画布点击
  const handleCanvasClick = useCallback(() => {
    if (linkingDevice) {
      setLinkingDevice(null)
    } else if (!dragState.current.isDragging && !draggingDevice) {
      setSelectedDevice(null)
    }
  }, [linkingDevice, draggingDevice])

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
    setLinkingDevice(null)
    message.success('画布已清空')
  }, [])

  const selectedDeviceInfo = devices.find((d) => d.id === selectedDevice)

  return (
    <div className="freelab-page">
      {/* 顶部工具栏 */}
      <div className="freelab-toolbar">
        <Space size="small">
          <Button
            className="toolbar-btn"
            onClick={() => handleAddDevice('host')}
            icon={<DesktopOutlined />}
            size="small"
          >
            主机
          </Button>
          <Button
            className="toolbar-btn"
            onClick={() => handleAddDevice('router')}
            icon={<ApartmentOutlined />}
            size="small"
          >
            路由器
          </Button>
          <Button
            className="toolbar-btn"
            onClick={() => handleAddDevice('switch')}
            icon={<SwapOutlined />}
            size="small"
          >
            交换机
          </Button>
          <Button
            className="toolbar-btn"
            onClick={() => handleAddDevice('cloud')}
            icon={<CloudOutlined />}
            size="small"
          >
            云
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
            <p>✋ 拖拽调整位置</p>
            <p>🔗 点击 + 号连线</p>
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
              <p>从左侧拖拽设备到画布</p>
              <p className="sub">或点击顶部工具栏快速添加</p>
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
                </defs>
                {connections.map((conn) => {
                  const source = devices.find((d) => d.id === conn.source)
                  const dest = devices.find((d) => d.id === conn.destination)
                  if (!source || !dest) return null
                  return (
                    <line
                      key={conn.id}
                      x1={source.x + 30}
                      y1={source.y + 30}
                      x2={dest.x + 30}
                      y2={dest.y + 30}
                      stroke={conn.status === 'active' ? '#30D158' : '#FF3B30'}
                      strokeWidth={2}
                      strokeDasharray={conn.status === 'active' ? 'none' : '5,5'}
                      markerEnd="url(#arrowhead)"
                      className="connection-path"
                    />
                  )
                })}
                {/* 正在连线时的临时线 */}
                {linkingDevice && (() => {
                  const linkingDev = devices.find((d) => d.id === linkingDevice)
                  const devX = linkingDev?.x ?? 0
                  const devY = linkingDev?.y ?? 0
                  return (
                    <line
                      x1={devX + 30}
                      y1={devY + 30}
                      x2={devX + 30}
                      y2={devY + 30}
                      stroke="#007AFF"
                      strokeWidth={3}
                      strokeDasharray="5,5"
                      className="linking-preview"
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
                    {/* 连接端口 */}
                    <div className="lab-ports">
                      <div className="port port-north"></div>
                      <div className="port port-east"></div>
                      <div className="port port-south"></div>
                      <div className="port port-west"></div>
                    </div>

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

                    {/* 状态指示器 */}
                    <div className="lab-status-indicator"></div>

                    {/* 连线按钮 */}
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
        </div>
      </div>
    </div>
  )
}
