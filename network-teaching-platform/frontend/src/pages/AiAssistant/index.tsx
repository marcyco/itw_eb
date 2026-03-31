/**
 * Coze AI 智能助手页面
 * 集成 Coze 平台的 AI 问答功能
 */
import { useState, useRef, useEffect } from 'react'
import { Button, Input, Space, Typography, Spin, Avatar, message } from 'antd'
import type { TextAreaRef } from 'antd/es/input/TextArea'
import {
  SendOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  ExportOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './index.css'

const { Title, Paragraph } = Typography

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface BotConfig {
  botId: string
  userId: string
  personalAccessToken: string
}

export default function AiAssistantPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '👋 你好！我是 NetLab AI 智能助手，基于 Coze 平台构建。\n\n我可以帮助你：\n• 解答网络协议相关问题\n• 指导实验操作步骤\n• 提供学习建议和资源\n• 解答技术疑问\n\n请问有什么可以帮助你的？',
      timestamp: Date.now(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [botConfig, setBotConfig] = useState<BotConfig>({
    botId: '',
    userId: '',
    personalAccessToken: '',
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<TextAreaRef>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('coze_bot_config')
    if (savedConfig) {
      try {
        setBotConfig(JSON.parse(savedConfig))
      } catch (e) {
        console.error('加载配置失败:', e)
      }
    }
  }, [])

  // 保存配置
  const handleSaveConfig = () => {
    localStorage.setItem('coze_bot_config', JSON.stringify(botConfig))
    setShowConfig(false)
    message.success('配置已保存')
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // 调用 Coze API
      const response = await callCozeAPI(inputValue.trim())

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: '❌ 抱歉，AI 助手暂时无法响应。请检查网络或配置后重试。',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  // 调用 Coze API
  const callCozeAPI = async (query: string): Promise<string> => {
    // TODO: 集成真实的 Coze API
    // 以下是示例代码，需要根据实际 Coze API 文档调整

    if (!botConfig.botId || !botConfig.userId || !botConfig.personalAccessToken) {
      // 如果没有配置，返回提示
      return `🔧 **需要配置 Coze Bot**\n\n请点击右上角的设置按钮，配置以下信息：\n• Bot ID\n• User ID  \n• Personal Access Token\n\n配置完成后，我就可以为你提供服务了！\n\nCoze 平台地址：https://www.coze.cn`
    }

    try {
      // Coze API 调用示例
      const response = await fetch('https://api.coze.cn/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${botConfig.personalAccessToken}`,
        },
        body: JSON.stringify({
          bot_id: botConfig.botId,
          user_id: botConfig.userId,
          query: query,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`API 错误：${response.status}`)
      }

      const data = await response.json()
      return data.content || data.answer || '收到回复，但内容为空'
    } catch (error) {
      console.error('Coze API 调用失败:', error)
      throw error
    }
  }

  // 清空对话
  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '👋 对话已清空。有什么可以帮助你的？',
        timestamp: Date.now(),
      },
    ])
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="ai-assistant-page">
      {/* 顶部导航栏 */}
      <div className="ai-header">
        <div className="ai-header-left">
          <Button
            className="back-btn"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            size="small"
          >
            返回
          </Button>
          <div className="ai-title">
            <CustomerServiceOutlined className="ai-icon" />
            <div>
              <Title level={4} style={{ margin: 0 }}>AI 智能助手</Title>
              <Paragraph style={{ margin: 0, fontSize: 12 }}>Powered by Coze</Paragraph>
            </div>
          </div>
        </div>

        <div className="ai-header-actions">
          <Space size="small">
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setShowConfig(!showConfig)}
              title="配置 Coze Bot"
            >
              配置
            </Button>
            <Button
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleClearChat}
              title="清空对话"
            >
              清空
            </Button>
            <a
              href="https://www.coze.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="coze-link"
            >
              <Button
                size="small"
                icon={<ExportOutlined />}
                title="访问 Coze 平台"
              >
                Coze
              </Button>
            </a>
          </Space>
        </div>
      </div>

      {/* 配置面板 */}
      {showConfig && (
        <div className="config-panel-overlay">
          <div className="config-panel">
            <Title level={5}>Coze Bot 配置</Title>
            <div className="config-item">
              <label>Bot ID</label>
              <Input
                value={botConfig.botId}
                onChange={(e) => setBotConfig({ ...botConfig, botId: e.target.value })}
                placeholder="在 Coze 平台创建 Bot 后获取"
              />
            </div>
            <div className="config-item">
              <label>User ID</label>
              <Input
                value={botConfig.userId}
                onChange={(e) => setBotConfig({ ...botConfig, userId: e.target.value })}
                placeholder="用户唯一标识"
              />
            </div>
            <div className="config-item">
              <label>Personal Access Token</label>
              <Input.Password
                value={botConfig.personalAccessToken}
                onChange={(e) => setBotConfig({ ...botConfig, personalAccessToken: e.target.value })}
                placeholder="在 Coze 平台生成访问令牌"
              />
            </div>
            <div className="config-actions">
              <Button onClick={() => setShowConfig(false)}>取消</Button>
              <Button type="primary" onClick={handleSaveConfig}>保存</Button>
            </div>
            <div className="config-help">
              <p>📖 配置说明：</p>
              <ol>
                <li>访问 <a href="https://www.coze.cn" target="_blank" rel="noopener noreferrer">Coze 平台</a> 创建 Bot</li>
                <li>在 Bot 设置中获取 Bot ID</li>
                <li>在个人设置中生成 Personal Access Token</li>
                <li>User ID 可以自定义（用于标识用户）</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="ai-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role} ${message.role === 'system' ? 'system-message' : ''}`}
          >
            {message.role === 'assistant' && (
              <Avatar
                className="message-avatar"
                icon={<CustomerServiceOutlined />}
                style={{ background: 'linear-gradient(135deg, #007AFF, #BD5AF2)' }}
              />
            )}
            <div className="message-content">
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? '你' : message.role === 'assistant' ? 'AI 助手' : '系统'}
                </span>
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="message-text">
                {message.content.split('\n').map((line, index) => (
                  <p key={index} style={{ margin: '4px 0' }}>{line}</p>
                ))}
              </div>
            </div>
            {message.role === 'user' && (
              <Avatar
                className="message-avatar"
                style={{ background: 'linear-gradient(135deg, #FF9500, #FF3B30)' }}
              >
                我
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message assistant loading">
            <Avatar
              className="message-avatar"
              icon={<CustomerServiceOutlined />}
              style={{ background: 'linear-gradient(135deg, #007AFF, #BD5AF2)' }}
            />
            <div className="message-content">
              <Spin size="small" />
              <span className="loading-text">AI 正在思考中...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="ai-input-area">
        <div className="ai-input-wrapper">
          <Input.TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题，按 Enter 发送..."
            rows={2}
            maxLength={2000}
            className="ai-input"
            disabled={isLoading}
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-btn"
            loading={isLoading}
          >
            发送
          </Button>
        </div>
        <div className="input-tips">
          <span>💡 提示：按 Enter 发送，Shift + Enter 换行</span>
          <span>最大长度 2000 字符</span>
        </div>
      </div>
    </div>
  )
}
