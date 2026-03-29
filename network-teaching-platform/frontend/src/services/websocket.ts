/**
 * WebSocket 服务
 * 用于与后端建立实时通信连接
 */

export type WSMessageType = 'packet' | 'topology' | 'config' | 'event' | 'ping' | 'pong' | 'connected'

export interface WSMessage {
  type: WSMessageType
  data?: any
  timestamp?: string
  client_id?: string
  experiment_id?: string
}

export type WSConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface WebSocketOptions {
  onMessage?: (message: WSMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string = ''
  private options: WebSocketOptions = {}
  private state: WSConnectionState = 'disconnected'
  private reconnectAttempts = 0
  private pingInterval: number | null = null
  private reconnectTimer: number | null = null

  constructor() {}

  /**
   * 连接到 WebSocket 服务器
   */
  connect(
    experimentId: string,
    options: WebSocketOptions = {}
  ): Promise<void> {
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...options,
    }

    const wsUrl = `ws://localhost:8000/ws/experiment/${experimentId}`
    this.url = wsUrl

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          this.state = 'connected'
          this.reconnectAttempts = 0
          console.log('[WebSocket] 已连接')
          this.startPing()
          this.options.onConnect?.()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data)
            console.log('[WebSocket] 收到消息:', message)
            this.options.onMessage?.(message)
          } catch (error) {
            console.error('[WebSocket] 消息解析失败:', error)
          }
        }

        this.ws.onclose = () => {
          this.state = 'disconnected'
          console.log('[WebSocket] 连接已关闭')
          this.stopPing()
          this.options.onDisconnect?.()
          this.attemptReconnect(experimentId)
        }

        this.ws.onerror = (error) => {
          this.state = 'error'
          console.error('[WebSocket] 错误:', error)
          this.options.onError?.(error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 断开 WebSocket 连接
   */
  disconnect(): void {
    this.stopPing()
    this.stopReconnect()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.state = 'disconnected'
    console.log('[WebSocket] 已断开连接')
  }

  /**
   * 发送消息
   */
  send(message: WSMessage): void {
    if (this.ws && this.state === 'connected') {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[WebSocket] 未连接，无法发送消息')
    }
  }

  /**
   * 发送数据包
   */
  sendPacket(packetData: any): void {
    this.send({
      type: 'packet_send',
      data: packetData,
    })
  }

  /**
   * 发送拓扑更新
   */
  sendTopologyUpdate(topologyData: any): void {
    this.send({
      type: 'topology_change',
      data: topologyData,
    })
  }

  /**
   * 发送配置更新
   */
  sendConfigUpdate(configData: any): void {
    this.send({
      type: 'config_update',
      data: configData,
    })
  }

  /**
   * 发送聊天消息
   */
  sendChatMessage(message: string): void {
    this.send({
      type: 'chat_message',
      data: { message },
    })
  }

  /**
   * 获取连接状态
   */
  getState(): WSConnectionState {
    return this.state
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.state === 'connected'
  }

  /**
   * 开始心跳
   */
  private startPing(): void {
    this.pingInterval = window.setInterval(() => {
      this.send({ type: 'ping' })
    }, 30000) // 每 30 秒发送一次心跳
  }

  /**
   * 停止心跳
   */
  private stopPing(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect(experimentId: string): void {
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 5)) {
      console.log('[WebSocket] 达到最大重连次数，放弃重连')
      return
    }

    this.reconnectAttempts++
    const delay = this.options.reconnectInterval || 3000

    console.log(`[WebSocket] 尝试重连 (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})...`)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect(experimentId, this.options)
    }, delay)
  }

  /**
   * 停止重连
   */
  private stopReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

// 导出单例
export const wsService = new WebSocketService()

/**
 * React Hook - 使用 WebSocket
 */
export function useWebSocket(experimentId: string | null, options?: WebSocketOptions) {
  import { useEffect, useState } from 'react'

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)

  useEffect(() => {
    if (!experimentId) return

    const handleConnect = () => {
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleMessage = (message: WSMessage) => {
      setLastMessage(message)
    }

    wsService
      .connect(experimentId, {
        ...options,
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onMessage: handleMessage,
      })
      .catch(console.error)

    return () => {
      wsService.disconnect()
    }
  }, [experimentId])

  return {
    isConnected,
    lastMessage,
    send: (message: WSMessage) => wsService.send(message),
    sendPacket: (data: any) => wsService.sendPacket(data),
    disconnect: () => wsService.disconnect(),
  }
}
