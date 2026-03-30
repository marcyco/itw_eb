/**
 * 设备节点组件 - 简化版
 * 用于显示设备节点，拖拽逻辑已移至 ExperimentCanvas
 */
import { DesktopOutlined, ApartmentOutlined, SwapOutlined, CloudOutlined } from '@ant-design/icons'
import { Device, DeviceType } from './ExperimentCanvas'
import './index.css'

interface DeviceNodeProps {
  device: Device
  isSelected: boolean
  isConnecting: boolean
  onSelect: (id: string) => void
}

export default function DeviceNode({ device, isSelected, isConnecting, onSelect }: DeviceNodeProps) {
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
  }

  return (
    <div
      className={`device-node ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''}`}
      style={{
        left: device.x,
        top: device.y,
        '--device-color': getColor(device.type),
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
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
