/**
 * 设备节点组件
 * 支持拖拽、选择、显示设备信息
 */
import { useState } from 'react'
import { DesktopOutlined, ApartmentOutlined, SwapOutlined, CloudOutlined } from '@ant-design/icons'
import { Device, DeviceType } from './ExperimentCanvas'
import './index.css'

interface DeviceNodeProps {
  device: Device
  isSelected: boolean
  isConnecting: boolean
  onSelect: (id: string) => void
  onDrag: (id: string, x: number, y: number) => void
}

export default function DeviceNode({ device, isSelected, isConnecting, onSelect, onDrag }: DeviceNodeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const getIcon = (type: DeviceType) => {
    switch (type) {
      case 'host':
        return <DesktopOutlined />
      case 'router':
        return <ApartmentOutlined />
      case 'switch':
        return <SwapOutlined />
      case 'cloud':
        return <CloudOutlined />
    }
  }

  const getColor = (type: DeviceType) => {
    switch (type) {
      case 'host':
        return '#007AFF'
      case 'router':
        return '#FF9500'
      case 'switch':
        return '#30D158'
      case 'cloud':
        return '#BF5AF2'
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(device.id)
    setIsDragging(true)

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const parent = (e.target as HTMLElement).closest('.canvas-grid')
    if (!parent) return

    const parentRect = parent.getBoundingClientRect()
    const scale = 1 // 可以考虑 zoom 因子

    const newX = (e.clientX - parentRect.left) / scale
    const newY = (e.clientY - parentRect.top) / scale

    onDrag(device.id, newX, newY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={`device-node ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: device.x,
        top: device.y,
        '--device-color': getColor(device.type),
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="device-icon">
        {getIcon(device.type)}
      </div>
      <div className="device-info">
        <div className="device-name">{device.config.name}</div>
        {device.config.ip && <div className="device-ip">{device.config.ip}</div>}
      </div>
      {isConnecting && (
        <div className="connecting-indicator">
          <div className="pulse-ring"></div>
        </div>
      )}
    </div>
  )
}
