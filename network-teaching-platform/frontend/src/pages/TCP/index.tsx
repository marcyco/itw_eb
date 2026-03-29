import ProtocolLearningPage from '../ProtocolLearning'

const tcpSlides = [
  {
    title: 'TCP 连接管理：三次握手',
    content: 'TCP 建立连接需要三次握手：1) 客户端发送 SYN 包；2) 服务器响应 SYN-ACK 包；3) 客户端发送 ACK 包。这样确保双方都准备好通信。',
  },
  {
    title: '可靠传输：滑动窗口机制',
    content: '滑动窗口允许发送方在未收到确认的情况下发送多个数据包。窗口大小决定了同时传输的数据量，提高了传输效率。',
  },
  {
    title: '流量控制：拥塞避免与快速重传',
    content: '当收到 3 个重复 ACK 时，触发快速重传机制，立即重传丢失的数据包，而不必等待超时。慢启动和拥塞避免算法防止网络过载。',
  },
]

export default function TCPPage() {
  return (
    <ProtocolLearningPage
      protocol="tcp"
      title="TCP 协议学习"
      slides={tcpSlides}
      experimentConfig={{
        windowSize: 3,
        simulateLoss: false,
        congestionControl: 'reno',
      }}
    />
  )
}
