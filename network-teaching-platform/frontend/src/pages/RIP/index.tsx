import ProtocolLearningPage from '../ProtocolLearning'
import './index.css'

const ripSlides = [
  {
    title: 'RIP：距离矢量路由协议',
    content: 'RIP（路由信息协议）使用跳数（Hop Count）作为度量值，最大跳数为 15（16 表示不可达）。路由器每 30 秒广播一次路由表，与邻居交换路由信息。',
    diagram: (
      <div className="protocol-diagram rip-topology">
        <div className="topology-diagram">
          <div className="router-node">
            <div className="router-icon">📡</div>
            <div className="router-label">R1</div>
            <div className="routing-table-mini">
              <div className="rt-entry"><span>192.168.1.0</span><span>直连</span></div>
            </div>
          </div>
          <div className="link-line">
            <div className="link-arrow">→</div>
          </div>
          <div className="router-node">
            <div className="router-icon">📡</div>
            <div className="router-label">R2</div>
            <div className="routing-table-mini">
              <div className="rt-entry"><span>192.168.2.0</span><span>直连</span></div>
            </div>
          </div>
          <div className="link-line">
            <div className="link-arrow">→</div>
          </div>
          <div className="router-node">
            <div className="router-icon">📡</div>
            <div className="router-label">R3</div>
            <div className="routing-table-mini">
              <div className="rt-entry"><span>192.168.3.0</span><span>直连</span></div>
            </div>
          </div>
        </div>
        <div className="rip-info">
          <div className="info-item">
            <span className="info-label">度量值</span>
            <span className="info-value">跳数 (1-15)</span>
          </div>
          <div className="info-item">
            <span className="info-label">更新周期</span>
            <span className="info-value">30 秒</span>
          </div>
          <div className="info-item">
            <span className="info-label">最大跳数</span>
            <span className="info-value">15 (16=不可达)</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: '路由更新：距离矢量算法',
    content: '每个路由器维护到所有已知网络的距离（跳数）。收到邻居更新时，比较经过邻居的距离是否更短，如果是则更新路由表。通过多轮更新，所有路由表逐渐收敛。',
    diagram: (
      <div className="protocol-diagram dv-algorithm">
        <div className="algorithm-step">
          <div className="step-title">步骤 1: 初始化</div>
          <div className="step-table">
            <div className="table-header"><span>目的网络</span><span>下一跳</span><span>跳数</span></div>
            <div className="table-row"><span>192.168.1.0</span><span>直连</span><span>1</span></div>
          </div>
        </div>
        <div className="algorithm-arrow">↓</div>
        <div className="algorithm-step">
          <div className="step-title">步骤 2: 收到邻居更新</div>
          <div className="update-packet">
            <span>来自 R2: 192.168.2.0 (跳数=1)</span>
          </div>
        </div>
        <div className="algorithm-arrow">↓</div>
        <div className="algorithm-step">
          <div className="step-title">步骤 3: 更新路由表</div>
          <div className="step-table">
            <div className="table-header"><span>目的网络</span><span>下一跳</span><span>跳数</span></div>
            <div className="table-row"><span>192.168.1.0</span><span>直连</span><span>1</span></div>
            <div className="table-row"><span>192.168.2.0</span><span>R2</span><span>2</span></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: '环路避免机制',
    content: '水平分割：不从接收路由的接口再发送该路由。毒性逆转：将学到的路由标记为不可达（跳数=16）后发回给原邻居。Hold-down：路由失效后暂时冻结，防止接受旧路由。',
    diagram: (
      <div className="protocol-diagram loop-prevention">
        <div className="prevention-card">
          <div className="prevention-icon">🛡️</div>
          <h4>水平分割</h4>
          <p>从接口 A 学到的路由，不再从接口 A 发回</p>
          <div className="example">R1→R2 的路由，R2 不再发回给 R1</div>
        </div>
        <div className="prevention-card">
          <div className="prevention-icon">☠️</div>
          <h4>毒性逆转</h4>
          <p>将路由标记为不可达后发回原邻居</p>
          <div className="example">R2 告诉 R1: 到 R1 的路由跳数=16</div>
        </div>
        <div className="prevention-card">
          <div className="prevention-icon">⏱️</div>
          <h4>Hold-down</h4>
          <p>路由失效后暂时冻结一段时间</p>
          <div className="example">180 秒内不接受该路由的更新</div>
        </div>
      </div>
    ),
  },
  {
    title: '路由收敛过程',
    content: '当网络拓扑变化（如链路故障）时，路由器通过触发更新立即通知邻居。邻居再通知它们的邻居，变化信息像波纹一样传播，直到所有路由表重新收敛。',
    diagram: (
      <div className="protocol-diagram convergence">
        <div className="convergence-stage">
          <div className="stage-label">阶段 1: 正常状态</div>
          <div className="network-viz">
            <span>R1</span><span className="link-ok">═══</span><span>R2</span><span className="link-ok">═══</span><span>R3</span>
          </div>
          <div className="stage-status">✅ 所有路由可达</div>
        </div>
        <div className="convergence-stage">
          <div className="stage-label">阶段 2: 链路故障</div>
          <div className="network-viz">
            <span>R1</span><span className="link-broken">═══</span><span>R2</span><span className="link-ok">═══</span><span>R3</span>
          </div>
          <div className="stage-status">⚠️ R1-R2 链路断开</div>
        </div>
        <div className="convergence-stage">
          <div className="stage-label">阶段 3: 触发更新</div>
          <div className="network-viz">
            <span>R1</span><span className="link-broken">═══</span><span>R2</span><span className="link-update">→→→</span><span>R3</span>
          </div>
          <div className="stage-status">📡 R2 发送毒性逆转更新</div>
        </div>
        <div className="convergence-stage">
          <div className="stage-label">阶段 4: 重新收敛</div>
          <div className="network-viz">
            <span>R1</span><span className="link-broken">═══</span><span>R2</span><span className="link-ok">═══</span><span>R3</span>
          </div>
          <div className="stage-status">✅ R3 通过其他路径可达</div>
        </div>
      </div>
    ),
  },
]

export default function RIPPage() {
  return (
    <ProtocolLearningPage
      protocol="rip"
      title="RIP 协议学习"
      slides={ripSlides}
      experimentConfig={{
        updateInterval: 30,
        splitHorizon: true,
        poisonReverse: true,
      }}
    />
  )
}
