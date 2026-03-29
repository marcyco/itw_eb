import { Card } from 'antd'
import './index.css'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
}

export default function GlassCard({ 
  children, 
  className = '', 
  hoverable = false,
  onClick 
}: GlassCardProps) {
  return (
    <Card
      className={`glass-card ${className}`}
      hoverable={hoverable}
      onClick={onClick}
      bordered={false}
    >
      {children}
    </Card>
  )
}
