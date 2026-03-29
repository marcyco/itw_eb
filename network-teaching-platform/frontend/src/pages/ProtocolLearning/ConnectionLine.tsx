/**
 * 连线组件
 * 绘制设备之间的连接线
 */
import { memo } from 'react'
import { Connection } from './ExperimentCanvas'

interface Point {
  x: number
  y: number
}

interface ConnectionLineProps {
  connection: Connection
  source: Point
  destination: Point
  isSelected: boolean
}

const ConnectionLine = memo(({ connection, source, destination, isSelected }: ConnectionLineProps) => {
  // 计算连线的中点
  const midX = (source.x + destination.x) / 2
  const midY = (source.y + destination.y) / 2

  // 计算连线角度
  const angle = Math.atan2(destination.y - source.y, destination.x - source.x) * (180 / Math.PI)

  // 连线样式
  const strokeColor = connection.status === 'active' ? '#30D158' : '#FF3B30'
  const strokeWidth = isSelected ? 4 : 2
  const strokeDasharray = connection.status === 'active' ? 'none' : '5,5'

  return (
    <g className="connection-line">
      {/* 主连线 */}
      <line
        x1={source.x}
        y1={source.y}
        x2={destination.x}
        y2={destination.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        className="connection-path"
      />

      {/* 连线方向箭头 */}
      <polygon
        points={`${destination.x - 10},${destination.y - 5} ${destination.x},${destination.y} ${destination.x - 10},${destination.y + 5}`}
        fill={strokeColor}
        transform={`rotate(${angle}, ${destination.x}, ${destination.y})`}
      />

      {/* 连线状态指示器（中点） */}
      <circle cx={midX} cy={midY} r={6} fill={strokeColor} className="connection-status" />

      {/* 选中时的外框 */}
      {isSelected && (
        <line
          x1={source.x}
          y1={source.y}
          x2={destination.x}
          y2={destination.y}
          stroke="rgba(0, 122, 255, 0.3)"
          strokeWidth={12}
          className="selection-highlight"
        />
      )}
    </g>
  )
})

export default ConnectionLine
