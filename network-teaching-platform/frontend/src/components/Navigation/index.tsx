import { useState, useEffect } from 'react'
import { Menu } from 'antd'
import {
  HomeOutlined,
  ApiOutlined,
  CloudServerOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  GithubOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './index.css'

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
  { key: '/courses', icon: <AppstoreOutlined />, label: <Link to="/courses">课程</Link> },
  { key: '/tcp', icon: <ApiOutlined />, label: <Link to="/tcp">TCP</Link> },
  { key: '/udp', icon: <CloudServerOutlined />, label: <Link to="/udp">UDP</Link> },
  { key: '/http', icon: <FileTextOutlined />, label: <Link to="/http">HTTP</Link> },
  { key: '/rip', icon: <AppstoreOutlined />, label: <Link to="/rip">RIP</Link> },
  { key: '/ftp', icon: <DatabaseOutlined />, label: <Link to="/ftp">FTP</Link> },
  { key: '/freelab', icon: <ExperimentOutlined />, label: <Link to="/freelab">自由实验室</Link> },
]

interface NavigationProps {
  transparent?: boolean
  showMenu?: boolean
}

export default function Navigation({ transparent = false, showMenu = true }: NavigationProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(location.pathname)
  const [isHovered, setIsHovered] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setCurrent(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const shouldShowGlass = !transparent || isHovered || scrolled

  return (
    <header
      className={`navigation ${shouldShowGlass ? 'glass' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="navigation-content">
        {/* Logo */}
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-icon">
            <ExperimentOutlined />
          </div>
          <span className="logo-text">NetLab</span>
        </div>

        {/* Menu */}
        {showMenu && (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[current]}
            items={menuItems}
            className="navigation-menu"
            onClick={({ key }) => setCurrent(key)}
            overflowedIndicator={<AppstoreOutlined />}
          />
        )}

        {/* Right Actions */}
        <div className="navigation-actions">
          <button
            className="action-btn"
            onClick={() => setIsDark(!isDark)}
            title={isDark ? '切换到浅色模式' : '切换到深色模式'}
          >
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
            title="GitHub"
          >
            <GithubOutlined />
          </a>
        </div>
      </div>
    </header>
  )
}
