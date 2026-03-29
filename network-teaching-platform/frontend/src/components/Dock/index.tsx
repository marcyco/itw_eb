import { useState } from 'react'
import { Tooltip } from 'antd'
import {
  HomeOutlined,
  AppstoreOutlined,
  ApiOutlined,
  CloudServerOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import './index.css'

interface DockItem {
  key: string
  path: string
  icon: React.ReactNode
  label: string
  color: string
}

const dockItems: DockItem[] = [
  { key: 'home', path: '/', icon: <HomeOutlined />, label: '首页', color: 'linear-gradient(135deg, #007AFF, #5AC8FA)' },
  { key: 'courses', path: '/courses', icon: <AppstoreOutlined />, label: '课程', color: 'linear-gradient(135deg, #BF5AF2, #FF375F)' },
  { key: 'tcp', path: '/tcp', icon: <ApiOutlined />, label: 'TCP', color: 'linear-gradient(135deg, #007AFF, #5E5CE6)' },
  { key: 'udp', path: '/udp', icon: <CloudServerOutlined />, label: 'UDP', color: 'linear-gradient(135deg, #30D158, #5AC8FA)' },
  { key: 'http', path: '/http', icon: <FileTextOutlined />, label: 'HTTP', color: 'linear-gradient(135deg, #FF9500, #FF375F)' },
  { key: 'ftp', path: '/ftp', icon: <DatabaseOutlined />, label: 'FTP', color: 'linear-gradient(135deg, #AF52DE, #FF3B30)' },
  { key: 'freelab', path: '/freelab', icon: <ExperimentOutlined />, label: '实验室', color: 'linear-gradient(135deg, #5E5CE6, #BF5AF2)' },
]

export default function Dock() {
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const handleClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="dock-container">
      <div className="dock glass">
        {dockItems.map((item) => {
          const isActive = location.pathname === item.path
          const isHovered = hoveredKey === item.key

          return (
            <Tooltip key={item.key} title={item.label} placement="top">
              <div
                className={`dock-item ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                onClick={() => handleClick(item.path)}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div
                  className="dock-icon"
                  style={{ background: isActive ? item.color : undefined }}
                >
                  {item.icon}
                </div>
                {isActive && <div className="dock-indicator" />}
              </div>
            </Tooltip>
          )
        })}

        <div className="dock-separator" />

        <Tooltip title="设置" placement="top">
          <div className="dock-item settings">
            <div className="dock-icon">
              <SettingOutlined />
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
