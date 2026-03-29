/**
 * 新手引导组件
 * 首次访问用户的教学引导卡片
 */
import { useState, useEffect } from 'react'
import { Button, Typography, Modal } from 'antd'
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  ApiOutlined,
  DesktopOutlined,
  LinkOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import './index.css'

const { Title, Paragraph } = Typography

interface GuideSlide {
  title: string
  content: string
  icon: React.ReactNode
  color: string
  tip?: string
}

const guideSlides: GuideSlide[] = [
  {
    title: '欢迎来到 NetLab',
    content: 'NetLab 是一个交互式网络协议学习平台，通过可视化实验帮助你深入理解 TCP/IP 协议栈的核心概念。',
    icon: <ExperimentOutlined />,
    color: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
    tip: '点击右下角 "跳过" 可随时退出引导',
  },
  {
    title: '选择课程',
    content: '在课程页面，你可以看到 TCP、UDP、HTTP、RIP、FTP 等多种协议课程。点击任意卡片即可开始学习。',
    icon: <ApiOutlined />,
    color: 'linear-gradient(135deg, #BF5AF2, #FF375F)',
    tip: '每个课程包含知识卡片和实验两部分',
  },
  {
    title: '知识卡片',
    content: '每个协议都有多张知识卡片，涵盖核心概念。左右滑动或点击箭头切换卡片，底部圆点显示当前进度。',
    icon: <DesktopOutlined />,
    color: 'linear-gradient(135deg, #30D158, #5AC8FA)',
    tip: '建议按顺序阅读所有卡片后再进入实验',
  },
  {
    title: '进入实验',
    content: '滑动到最后一张卡片后，会出现"进入实验"按钮。点击即可切换到实验画布，观察协议的实际运行过程。',
    icon: <PlayCircleOutlined />,
    color: 'linear-gradient(135deg, #FF9500, #FF375F)',
    tip: '实验按钮有呼吸灯效果，很容易找到',
  },
  {
    title: '实验操作',
    content: '在实验画布中，你可以：1) 从左侧添加设备；2) 拖拽调整位置；3) 点击设备查看配置；4) 使用连线模式连接设备；5) 点击开始观察数据包动画。',
    icon: <LinkOutlined />,
    color: 'linear-gradient(135deg, #5E5CE6, #BF5AF2)',
    tip: '右侧面板可以调整实验参数',
  },
  {
    title: '准备就绪',
    content: '现在你已经了解了基本操作方法。开始你的网络协议学习之旅吧！',
    icon: <CheckCircleOutlined />,
    color: 'linear-gradient(135deg, #30D158, #5AC8FA)',
    tip: '随时可以点击底部 Dock 栏的图标切换页面',
  },
]

interface OnboardingGuideProps {
  onComplete?: () => void
  visible: boolean
}

export default function OnboardingGuide({ onComplete, visible }: OnboardingGuideProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(visible)

  useEffect(() => {
    setIsModalVisible(visible)
  }, [visible])

  const handleNext = () => {
    if (currentSlide < guideSlides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      finishGuide()
    }
  }

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const finishGuide = () => {
    setIsModalVisible(false)
    // 标记已看过引导
    localStorage.setItem('netlab_onboarding_completed', 'true')
    onComplete?.()
  }

  const handleSkip = () => {
    finishGuide()
  }

  const slide = guideSlides[currentSlide]
  const isLastSlide = currentSlide === guideSlides.length - 1

  return (
    <Modal
      open={isModalVisible}
      footer={null}
      closable={false}
      centered
      className="onboarding-modal"
      width={700}
    >
      <div className="onboarding-guide">
        {/* 进度条 */}
        <div className="onboarding-progress">
          <div
            className="progress-bar"
            style={{ width: `${((currentSlide + 1) / guideSlides.length) * 100}%` }}
          />
        </div>

        {/* 卡片内容 */}
        <div className="onboarding-content">
          <div
            className="onboarding-icon"
            style={{ background: slide.color }}
          >
            {slide.icon}
          </div>

          <Title level={2} className="onboarding-title">
            {slide.title}
          </Title>

          <Paragraph className="onboarding-content-text">
            {slide.content}
          </Paragraph>

          {slide.tip && (
            <div className="onboarding-tip">
              💡 {slide.tip}
            </div>
          )}
        </div>

        {/* 导航按钮 */}
        <div className="onboarding-navigation">
          <Button
            className="nav-btn"
            icon={<ArrowLeftOutlined />}
            onClick={handlePrev}
            disabled={currentSlide === 0}
          >
            上一步
          </Button>

          <div className="indicators">
            {guideSlides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          <Button
            type="primary"
            className="next-btn"
            onClick={handleNext}
            icon={isLastSlide ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
          >
            {isLastSlide ? '开始学习' : '下一步'}
          </Button>
        </div>

        {/* 跳过按钮 */}
        {!isLastSlide && (
          <Button
            type="text"
            className="skip-btn"
            onClick={handleSkip}
          >
            跳过引导
          </Button>
        )}
      </div>
    </Modal>
  )
}
