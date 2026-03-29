/**
 * API 服务层
 * 封装与后端的 HTTP 通信
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除并跳转登录
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ============================================
// 认证 API
// ============================================

export interface UserCreate {
  username: string
  email: string
  password: string
}

export interface UserLogin {
  username: string
  password: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export const authAPI = {
  // 用户注册
  register: (data: UserCreate): Promise<UserResponse> => {
    return api.post('/api/auth/register', data)
  },

  // 用户登录
  login: (data: UserLogin): Promise<TokenResponse> => {
    return api.post('/api/auth/login', data)
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<UserResponse> => {
    return api.get('/api/auth/me')
  },

  // 用户登出
  logout: (): Promise<{ message: string }> => {
    return api.post('/api/auth/logout')
  },
}

// ============================================
// 实验 API
// ============================================

export interface ExperimentData {
  id?: number
  title: string
  description?: string
  protocol_type: string
  topology_data?: any
  config?: any
  owner_id?: number
  created_at?: string
  updated_at?: string
}

export const experimentAPI = {
  // 创建实验
  create: (data: ExperimentData): Promise<ExperimentData> => {
    return api.post('/api/experiment/create', data)
  },

  // 获取实验详情
  getById: (id: number): Promise<ExperimentData> => {
    return api.get(`/api/experiment/${id}`)
  },

  // 更新实验
  update: (id: number, data: Partial<ExperimentData>): Promise<ExperimentData> => {
    return api.put(`/api/experiment/${id}`, data)
  },

  // 删除实验
  delete: (id: number): Promise<{ message: string }> => {
    return api.delete(`/api/experiment/${id}`)
  },

  // 获取我的实验列表
  getMyExperiments: (): Promise<ExperimentData[]> => {
    return api.get('/api/experiment/my')
  },
}

// ============================================
// 拓扑 API
// ============================================

export interface TopologyData {
  id?: number
  name: string
  description?: string
  nodes: any[]
  connections: any[]
  owner_id?: number
  created_at?: string
}

export const topologyAPI = {
  // 创建拓扑
  create: (data: TopologyData): Promise<TopologyData> => {
    return api.post('/api/topology/create', data)
  },

  // 获取拓扑详情
  getById: (id: number): Promise<TopologyData> => {
    return api.get(`/api/topology/${id}`)
  },

  // 更新拓扑
  update: (id: number, data: Partial<TopologyData>): Promise<TopologyData> => {
    return api.put(`/api/topology/${id}`, data)
  },

  // 删除拓扑
  delete: (id: number): Promise<{ message: string }> => {
    return api.delete(`/api/topology/${id}`)
  },

  // 获取我的拓扑列表
  getMyTopologies: (): Promise<TopologyData[]> => {
    return api.get('/api/topology/my')
  },
}

// ============================================
// TCP 协议实验 API
// ============================================

export interface TCPPacket {
  id: string
  protocol: string
  data: {
    src_port: number
    dst_port: number
    seq: number
    ack: number
    flags: number
    flags_text: string
    window_size: number
  }
  source: string
  destination: string
}

export const tcpAPI = {
  // 三次握手
  handshake: (client: string, server: string): Promise<{ packets: TCPPacket[] }> => {
    return api.post('/api/experiment/tcp/handshake', null, {
      params: { client, server },
    })
  },

  // 滑动窗口发送
  send: (payload: string, windowSize: number = 3, source: string = '', destination: string = ''): Promise<{ packets: TCPPacket[] }> => {
    return api.post('/api/experiment/tcp/send', null, {
      params: { payload, window_size: windowSize, source, destination },
    })
  },

  // 快速重传
  retransmit: (packetId: string, dupAcks: number = 3): Promise<{ packets: TCPPacket[] }> => {
    return api.post('/api/experiment/tcp/retransmit', null, {
      params: { packet_id: packetId, dup_acks: dupAcks },
    })
  },
}

// ============================================
// UDP 协议实验 API
// ============================================

export interface UDPPacket {
  id: string
  protocol: string
  data: {
    src_port: number
    dst_port: number
    length: number
    checksum: number
    payload: string
  }
  source: string
  destination: string
}

export const udpAPI = {
  // 发送 UDP 数据
  send: (payload: string, srcPort: number = 12345, dstPort: number = 80, source: string = '', destination: string = ''): Promise<{ packets: UDPPacket[] }> => {
    return api.post('/api/experiment/udp/send', null, {
      params: { payload, src_port: srcPort, dst_port: dstPort, source, destination },
    })
  },

  // UDP 广播
  broadcast: (payload: string, destinations: string[], srcPort: number = 12345, dstPort: number = 5000): Promise<{ packets: UDPPacket[] }> => {
    return api.post('/api/experiment/udp/broadcast', { payload, destinations, src_port: srcPort, dst_port: dstPort })
  },

  // IP 分片
  fragment: (payload: string, mtu: number = 1500): Promise<{ fragments: any[] }> => {
    return api.post('/api/experiment/udp/fragment', { payload, mtu })
  },

  // 重组分片
  reassemble: (fragments: any[]): Promise<{ data: string }> => {
    return api.post('/api/experiment/udp/reassemble', fragments)
  },
}

// ============================================
// HTTP 协议实验 API
// ============================================

export interface HTTPRequest {
  method: string
  url: string
  headers?: Record<string, string>
  body?: any
}

export const httpAPI = {
  // 发送 HTTP 请求
  request: (data: HTTPRequest): Promise<{ request: any; response: any }> => {
    return api.post('/api/experiment/http/request', data)
  },

  // TLS 握手
  tlsHandshake: (): Promise<{ steps: any[] }> => {
    return api.get('/api/experiment/http/tls-handshake')
  },
}

// ============================================
// RIP 协议实验 API
// ============================================

export const ripAPI = {
  // 发送 RIP 更新
  update: (routerId: string, routes: any[]): Promise<{ packet: any }> => {
    return api.post('/api/experiment/rip/update', { router_id: routerId, routes })
  },

  // 路由收敛
  convergence: (routers: string[], initialRoutes: any): Promise<{ updates: any[]; routing_tables: any }> => {
    return api.post('/api/experiment/rip/convergence', { routers, initial_routes: initialRoutes })
  },

  // 链路故障
  linkFailure: (routerId: string, failedNeighbor: string): Promise<{ updates: any[] }> => {
    return api.post('/api/experiment/rip/link-failure', { router_id: routerId, failed_neighbor: failedNeighbor })
  },
}

// ============================================
// FTP 协议实验 API
// ============================================

export const ftpAPI = {
  // FTP 登录
  login: (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    return api.post('/api/experiment/ftp/login', { username, password })
  },

  // 建立数据连接
  dataConnection: (mode: 'active' | 'passive'): Promise<{ port: number }> => {
    return api.post('/api/experiment/ftp/data-connection', { mode })
  },

  // 上传文件
  upload: (filename: string, content: string): Promise<{ success: boolean }> => {
    return api.post('/api/experiment/ftp/upload', { filename, content })
  },

  // 下载文件
  download: (filename: string): Promise<{ content: string }> => {
    return api.post('/api/experiment/ftp/download', { filename })
  },
}
