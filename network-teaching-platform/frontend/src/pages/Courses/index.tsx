import { Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  ApiOutlined,
  CloudServerOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import './index.css'

const { Title } = Typography

const courses = [
  {
    key: 'tcp',
    path: '/tcp',
    title: 'TCP',
    subtitle: '传输控制协议',
    description: '可靠的、面向连接的传输层协议',
    icon: <ApiOutlined />,
    color: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
    features: ['三次握手', '滑动窗口', '拥塞控制', '快速重传'],
  },
  {
    key: 'udp',
    path: '/udp',
    title: 'UDP',
    subtitle: '用户数据报协议',
    description: '快速的、无连接的传输层协议',
    icon: <CloudServerOutlined />,
    color: 'linear-gradient(135deg, #30D158, #5AC8FA)',
    features: ['无连接', '支持广播', 'IP 分片', '低延迟'],
  },
  {
    key: 'http',
    path: '/http',
    title: 'HTTP',
    subtitle: '超文本传输协议',
    description: 'Web 通信的应用层协议',
    icon: <FileTextOutlined />,
    color: 'linear-gradient(135deg, #FF9500, #FF375F)',
    features: ['请求响应', '状态码', 'Header', 'TLS 加密'],
  },
  {
    key: 'rip',
    path: '/rip',
    title: 'RIP',
    subtitle: '路由信息协议',
    description: '基于距离矢量的内部网关协议',
    icon: <AppstoreOutlined />,
    color: 'linear-gradient(135deg, #FF3B30, #FF9500)',
    features: ['距离矢量', '路由收敛', '水平分割', '毒性逆转'],
  },
  {
    key: 'ftp',
    path: '/ftp',
    title: 'FTP',
    subtitle: '文件传输协议',
    description: '用于文件上传下载的应用层协议',
    icon: <DatabaseOutlined />,
    color: 'linear-gradient(135deg, #AF52DE, #FF375F)',
    features: ['控制连接', '数据连接', '主动模式', '被动模式'],
  },
  {
    key: 'freelab',
    path: '/freelab',
    title: '自由实验室',
    subtitle: '综合实验平台',
    description: '自由构建拓扑，进行综合实验',
    icon: <ExperimentOutlined />,
    color: 'linear-gradient(135deg, #5E5CE6, #BF5AF2)',
    features: ['拖拽设备', '手动连线', '协议分析', '抓包工具'],
  },
]

export default function CoursesPage() {
  const navigate = useNavigate()

  const handleCardClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <Title className="courses-title">选择课程</Title>
        <p className="courses-subtitle">
          点击卡片开始学习协议知识
        </p>
      </div>

      <div className="courses-grid">
        {courses.map((course, index) => (
          <div
            key={course.key}
            className="course-card scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleCardClick(course.path)}
          >
            <div className="course-card-inner">
              <div
                className="course-icon"
                style={{ background: course.color }}
              >
                {course.icon}
              </div>
              
              <div className="course-info">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-subtitle">{course.subtitle}</p>
                <p className="course-description">{course.description}</p>
              </div>

              <div className="course-features">
                {course.features.map((feature, i) => (
                  <span key={i} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="course-action">
                开始学习 <ArrowRightOutlined />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
