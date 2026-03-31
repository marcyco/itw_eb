import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import OnboardingGuide from './components/OnboardingGuide'
import HomePage from './pages/Home'
import CoursesPage from './pages/Courses'
import TCPPage from './pages/TCP'
import UDPPage from './pages/UDP'
import HTTPPage from './pages/HTTP'
import RIPPage from './pages/RIP'
import FTPPage from './pages/FTP'
import FreeLabPage from './pages/FreeLab'
import AiAssistantPage from './pages/AiAssistant'
import './styles/index.css'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // 检查是否已看过引导
    const hasCompletedOnboarding = localStorage.getItem('netlab_onboarding_completed')
    if (!hasCompletedOnboarding) {
      // 延迟显示，等待页面加载
      setTimeout(() => {
        setShowOnboarding(true)
      }, 500)
    }
  }, [])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#007AFF',
          borderRadius: 12,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Button: {
            borderRadius: 20,
            algorithm: true,
          },
          Card: {
            borderRadiusLG: 16,
          },
          Menu: {
            borderRadiusLG: 8,
          },
        },
      }}
    >
      <BrowserRouter>
        <div className="app">
          <Navigation transparent showMenu />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/tcp" element={<TCPPage />} />
              <Route path="/udp" element={<UDPPage />} />
              <Route path="/http" element={<HTTPPage />} />
              <Route path="/rip" element={<RIPPage />} />
              <Route path="/ftp" element={<FTPPage />} />
              <Route path="/freelab" element={<FreeLabPage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <OnboardingGuide
            visible={showOnboarding}
            onComplete={() => setShowOnboarding(false)}
          />
        </div>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
