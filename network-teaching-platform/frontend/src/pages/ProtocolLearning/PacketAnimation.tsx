/**
 * 数据包动画组件
 * 在连线上显示移动的数据包
 */
import { memo } from 'react'
import { Packet } from './ExperimentCanvas'
import './index.css'

interface Point {
  x: number
  y: number
}

interface PacketAnimationProps {
  packet: Packet
  source: Point
  destination: Point
}

const PacketAnimation = memo(({ packet, source, destination }: PacketAnimationProps) => {
  // 计算当前位置
  const currentX = source.x + (destination.x - source.x) * packet.currentProgress
  const currentY = source.y + (destination.y - source.y) * packet.currentProgress

  // 计算移动角度
  const angle = Math.atan2(destination.y - source.y, destination.x - source.x) * (180 / Math.PI)

  // 根据协议类型获取颜色
  const getPacketColor = (protocol: string) => {
    switch (protocol) {
      case 'tcp':
        return '#007AFF' // 蓝色
      case 'udp':
        return '#FF9500' // 橙色
      case 'http':
        return '#30D158' // 绿色
      case 'rip':
        return '#BF5AF2' // 紫色
      case 'ftp':
        return '#FF375F' // 粉色
      default:
        return '#5AC8FA' // 青色
    }
  }

  // 获取数据包标签
  const getPacketLabel = () => {
    if (packet.protocol === 'tcp') {
      if (packet.data.type === 'SYN') return 'SYN'
      if (packet.data.type === 'SYN-ACK') return 'SYN-ACK'
      if (packet.data.type === 'ACK') return 'ACK'
      if (packet.data.type === 'FIN') return 'FIN'
      if (packet.data.type === 'RST') return 'RST'
      return `Seq=${packet.data.seq}`
    }
    if (packet.protocol === 'udp') {
      return 'UDP'
    }
    if (packet.protocol === 'http') {
      if (packet.data.method) return packet.data.method
      if (packet.data.status) return packet.data.status.toString()
      return 'HTTP'
    }
    if (packet.protocol === 'rip') {
      return 'RIP'
    }
    if (packet.protocol === 'ftp') {
      return packet.data.command || 'FTP'
    }
    return ''
  }

  const color = getPacketColor(packet.protocol)

  return (
    <g
      className="packet-animation"
      style={{
        transform: `translate(${currentX}px, ${currentY}px) rotate(${angle}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* 数据包主体 */}
      <circle r={12} fill={color} className="packet-body">
        <animate
          attributeName="opacity"
          values="0.8;1;0.8"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 数据包外环 */}
      <circle r={16} fill="none" stroke={color} strokeWidth={2} opacity={0.5}>
        <animate
          attributeName="r"
          values="12;20"
          dur="0.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;0"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 数据包标签 */}
      <text
        x={20}
        y={5}
        fill={color}
        fontSize={11}
        fontWeight="bold"
        className="packet-label"
      >
        {getPacketLabel()}
      </text>

      {/* Seq/Ack 信息（TCP 专用） */}
      {packet.protocol === 'tcp' && packet.data.seq !== undefined && (
        <text
          x={20}
          y={20}
          fill="rgba(255,255,255,0.7)"
          fontSize={9}
        >
          Seq={packet.data.seq}
        </text>
      )}
    </g>
  )
})

export default PacketAnimation
