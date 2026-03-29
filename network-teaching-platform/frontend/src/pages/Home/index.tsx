import { useRef } from 'react'
import { Typography, Button } from 'antd'
import { ArrowRightOutlined, ApiOutlined, ExperimentOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ParticleBackground from './ParticleBackground'
import './index.css'

const { Title, Paragraph } = Typography

export default function HomePage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return (
    <div className="home-page">
      {/* 粒子背景动画 */}
      <ParticleBackground canvasRef={canvasRef} />

      {/* 内容区域 */}
      <div className="home-content">
        <div className="home-hero">
          {/* 大标题 */}
          <Title
            className="home-title fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="gradient-text">NetLab</span>
          </Title>

          {/* 副标题 */}
          <Paragraph
            className="home-subtitle fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            探索网络协议的奥秘
          </Paragraph>

          {/* 描述文字 */}
          <Paragraph
            className="home-description fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            通过交互式知识卡片和仿真实验，<br />
            深入理解 TCP、UDP、HTTP、RIP、FTP 等核心协议
          </Paragraph>

          {/* CTA 按钮 */}
          <div
            className="home-cta fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            <Button
              type="primary"
              size="large"
              className="cta-button breathing"
              onClick={() => navigate('/courses')}
              icon={<ArrowRightOutlined />}
            >
              开始学习
            </Button>
          </div>

          {/* 特性卡片 */}
          <div className="features-grid">
            <div className="feature-card glass-light fade-in" style={{ animationDelay: '1s' }}>
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #007AFF, #5AC8FA)' }}>
                <ApiOutlined />
              </div>
              <h3>交互式学习</h3>
              <p>滑动卡片，点击实验，深度理解协议原理</p>
            </div>

            <div className="feature-card glass-light fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #30D158, #5AC8FA)' }}>
                <ExperimentOutlined />
              </div>
              <h3>仿真实验</h3>
              <p>真实模拟数据包传输，观察协议行为</p>
            </div>

            <div className="feature-card glass-light fade-in" style={{ animationDelay: '1.4s' }}>
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #BF5AF2, #FF375F)' }}>
                <AppstoreOutlined />
              </div>
              <h3>多协议支持</h3>
              <p>涵盖 TCP/IP 协议栈核心协议</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
