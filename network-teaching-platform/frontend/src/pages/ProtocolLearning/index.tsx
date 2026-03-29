import { useState } from 'react'
import { Typography, Button } from 'antd'
import { LeftOutlined, RightOutlined, ExperimentOutlined } from '@ant-design/icons'
import KnowledgeCard from './KnowledgeCard'
import ExperimentCanvas from './ExperimentCanvas'
import OSIPanel from '@/components/OSIPanel'
import './index.css'

const { Title } = Typography

interface KnowledgeSlide {
  title: string
  content: string
  diagram?: React.ReactNode
}

interface ProtocolLearningPageProps {
  protocol: string
  title: string
  slides: KnowledgeSlide[]
  experimentConfig?: any
}

export default function ProtocolLearningPage({
  protocol,
  title,
  slides,
  experimentConfig,
}: ProtocolLearningPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showExperiment, setShowExperiment] = useState(false)

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))
  }

  const handleStartExperiment = () => {
    setShowExperiment(true)
  }

  const isLastSlide = currentSlide === slides.length - 1

  if (showExperiment) {
    return (
      <div className="experiment-page">
        <ExperimentCanvas
          protocol={protocol}
          config={experimentConfig}
          onBack={() => setShowExperiment(false)}
        />
        <OSIPanel />
      </div>
    )
  }

  return (
    <div className="protocol-learning-page">
      <div className="learning-content">
        {/* 知识卡片区域 */}
        <div className="cards-container">
          <div className="card-header">
            <Title className="protocol-title">{title}</Title>
            <p className="protocol-subtitle">
              滑动卡片学习知识点 ({currentSlide + 1} / {slides.length})
            </p>
          </div>

          <div className="cards-wrapper">
            <Button
              className="nav-btn"
              icon={<LeftOutlined />}
              onClick={handlePrev}
              disabled={currentSlide === 0}
            />

            <div className="cards-viewport">
              <KnowledgeCard
                slide={slides[currentSlide]}
                isActive={true}
              />
            </div>

            <Button
              className="nav-btn"
              icon={<RightOutlined />}
              onClick={handleNext}
              disabled={currentSlide === slides.length - 1}
            />
          </div>

          {/* 指示器 */}
          <div className="slide-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          {/* 进入实验按钮 */}
          {isLastSlide && (
            <div className="experiment-cta fade-in">
              <Button
                type="primary"
                size="large"
                className="experiment-btn breathing"
                onClick={handleStartExperiment}
                icon={<ExperimentOutlined />}
              >
                进入实验
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
