import ProtocolLearningPage from '../ProtocolLearning'
import './index.css'

const udpSlides = [
  {
    title: 'UDP：无连接的快速传输',
    content: 'UDP（用户数据报协议）是无连接的传输层协议，不需要握手即可发送数据。它提供面向报文的服务，每个 UDP 报文作为一个独立的数据包传输。',
    diagram: (
      <div className="protocol-diagram">
        <div className="diagram-row">
          <div className="diagram-label">UDP 头部（8 字节）</div>
          <div className="diagram-boxes">
            <div className="diagram-box">源端口 (2 字节)</div>
            <div className="diagram-box">目的端口 (2 字节)</div>
            <div className="diagram-box">长度 (2 字节)</div>
            <div className="diagram-box">校验和 (2 字节)</div>
          </div>
        </div>
        <div className="diagram-row">
          <div className="diagram-label">数据</div>
          <div className="diagram-box wide">应用层数据 (0-65535 字节)</div>
        </div>
      </div>
    ),
  },
  {
    title: 'UDP vs TCP：设计哲学对比',
    content: 'TCP 提供可靠传输，需要三次握手建立连接，有确认和重传机制。UDP 不保证可靠交付，但开销小、延迟低，适合实时应用。',
    diagram: (
      <div className="protocol-diagram comparison">
        <div className="comparison-card">
          <h4>TCP</h4>
          <ul>
            <li>✅ 可靠传输</li>
            <li>✅ 流量控制</li>
            <li>✅ 拥塞控制</li>
            <li>❌ 需要握手</li>
            <li>❌ 开销较大</li>
          </ul>
        </div>
        <div className="comparison-card">
          <h4>UDP</h4>
          <ul>
            <li>❌ 不可靠</li>
            <li>❌ 无流量控制</li>
            <li>❌ 无拥塞控制</li>
            <li>✅ 无需握手</li>
            <li>✅ 开销小</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: '数据分片：MTU 的限制',
    content: '当 UDP 数据包大小超过 MTU（最大传输单元，通常 1500 字节）时，IP 层会将数据包分片。每个分片带有标识、标志和偏移量，接收方根据这些信息重组原始数据。',
    diagram: (
      <div className="protocol-diagram">
        <div className="fragment-demo">
          <div className="fragment-original">
            <div className="fragment-label">原始数据包 (4000 字节)</div>
            <div className="fragment-bar" style={{ width: '100%' }}></div>
          </div>
          <div className="fragment-arrow">↓ 分片</div>
          <div className="fragment-pieces">
            <div className="fragment-piece">
              <span>分片 1 (1500 字节)</span>
              <small>偏移量=0, MF=1</small>
            </div>
            <div className="fragment-piece">
              <span>分片 2 (1500 字节)</span>
              <small>偏移量=185, MF=1</small>
            </div>
            <div className="fragment-piece">
              <span>分片 3 (1000 字节)</span>
              <small>偏移量=370, MF=0</small>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'UDP 的应用：实时通信',
    content: 'UDP 广泛应用于对实时性要求高的场景：DNS 查询（快速响应）、视频流（容忍少量丢包）、在线游戏（低延迟优先）、VoIP 电话等。',
    diagram: (
      <div className="protocol-diagram">
        <div className="app-grid">
          <div className="app-item">
            <div className="app-icon">🌐</div>
            <div className="app-name">DNS</div>
            <small>端口 53</small>
          </div>
          <div className="app-item">
            <div className="app-icon">📺</div>
            <div className="app-name">视频流</div>
            <small>实时传输</small>
          </div>
          <div className="app-item">
            <div className="app-icon">🎮</div>
            <div className="app-name">在线游戏</div>
            <small>低延迟</small>
          </div>
          <div className="app-item">
            <div className="app-icon">📞</div>
            <div className="app-name">VoIP</div>
            <small>语音通话</small>
          </div>
        </div>
      </div>
    ),
  },
]

export default function UDPPage() {
  return (
    <ProtocolLearningPage
      protocol="udp"
      title="UDP 协议学习"
      slides={udpSlides}
      experimentConfig={{
        mtu: 1500,
        simulateLoss: false,
      }}
    />
  )
}
