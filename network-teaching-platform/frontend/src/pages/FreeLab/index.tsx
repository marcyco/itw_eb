import { Typography } from 'antd'
import { ExperimentOutlined } from '@ant-design/icons'
import './index.css'

const { Title, Paragraph } = Typography

export default function FreeLabPage() {
  return (
    <div className="freelab-page">
      <div className="freelab-header">
        <div className="freelab-icon">
          <ExperimentOutlined />
        </div>
        <Title>自由实验室</Title>
        <Paragraph>
          拖拽设备、手动连线、配置参数，进行综合网络实验
        </Paragraph>
      </div>

      <div className="freelab-content">
        <div className="device-library glass">
          <h4>设备库</h4>
          <div className="device-list">
            <div className="device-item">
              <div className="device-icon">💻</div>
              <span>主机</span>
            </div>
            <div className="device-item">
              <div className="device-icon">🔀</div>
              <span>路由器</span>
            </div>
            <div className="device-item">
              <div className="device-icon">🔌</div>
              <span>交换机</span>
            </div>
            <div className="device-item">
              <div className="device-icon">☁️</div>
              <span>云</span>
            </div>
          </div>
        </div>

        <div className="canvas-area glass">
          <div className="canvas-placeholder">
            <ExperimentOutlined style={{ fontSize: 64, opacity: 0.3 }} />
            <p>从左侧拖拽设备到画布</p>
            <p className="sub">手动连线构建网络拓扑</p>
          </div>
        </div>

        <div className="config-panel glass">
          <h4>配置面板</h4>
          <div className="config-placeholder">
            <p>点击设备配置参数</p>
            <p className="sub">IP 地址、子网掩码、网关</p>
          </div>
        </div>
      </div>
    </div>
  )
}
