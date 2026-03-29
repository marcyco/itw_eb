import { Typography } from 'antd'
import './index.css'

const { Title, Paragraph } = Typography

interface KnowledgeSlide {
  title: string
  content: string
  diagram?: React.ReactNode
}

interface KnowledgeCardProps {
  slide: KnowledgeSlide
  isActive: boolean
}

export default function KnowledgeCard({ slide, isActive }: KnowledgeCardProps) {
  return (
    <div className={`knowledge-card glass ${isActive ? 'active' : ''}`}>
      <div className="card-content">
        <Title level={3} className="slide-title">
          {slide.title}
        </Title>
        
        <Paragraph className="slide-content">
          {slide.content}
        </Paragraph>
        
        {slide.diagram && (
          <div className="slide-diagram">
            {slide.diagram}
          </div>
        )}
      </div>
    </div>
  )
}
