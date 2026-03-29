import { useState, useEffect } from 'react'
import { Collapse, Typography, Tag, Empty } from 'antd'
import {
  CloseOutlined,
  DatabaseOutlined,
  WifiOutlined,
  CloudOutlined,
  FileTextOutlined,
  ApiOutlined,
  RightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import './index.css'

const { Title, Text, Paragraph } = Typography

const { Panel } = Collapse

interface OSIField {
  name: string
  value: string | number
  description?: string
}

interface OSILayer {
  layer: number
  name: string
  protocol: string
  icon: React.ReactNode
  fields: OSIField[]
  hex?: string
  rawData?: any
}

interface OSIPanelProps {
  visible?: boolean
  data?: OSILayer[]
  protocol?: string
  packetData?: any
  onClose?: () => void
}

// 默认 OSI 数据
const defaultOSIData: OSILayer[] = [
  {
    layer: 7,
    name: 'Application Layer',
    protocol: 'HTTP',
    icon: <FileTextOutlined />,
    fields: [
      { name: 'Method', value: 'GET' },
      { name: 'URL', value: '/index.html' },
      { name: 'Version', value: 'HTTP/1.1' },
      { name: 'Host', value: 'example.com' },
    ],
  },
  {
    layer: 4,
    name: 'Transport Layer',
    protocol: 'TCP',
    icon: <ApiOutlined />,
    fields: [
      { name: 'Source Port', value: '52341' },
      { name: 'Destination Port', value: '80' },
      { name: 'Sequence Number', value: '1024' },
      { name: 'Acknowledgment Number', value: '2048' },
      { name: 'Flags', value: 'ACK, PSH' },
      { name: 'Window Size', value: '65535' },
    ],
  },
  {
    layer: 3,
    name: 'Network Layer',
    protocol: 'IP',
    icon: <CloudOutlined />,
    fields: [
      { name: 'Source IP', value: '192.168.1.10' },
      { name: 'Destination IP', value: '93.184.216.34' },
      { name: 'Protocol', value: 'TCP' },
      { name: 'TTL', value: '64' },
    ],
  },
  {
    layer: 2,
    name: 'Data Link Layer',
    protocol: 'Ethernet',
    icon: <WifiOutlined />,
    fields: [
      { name: 'Source MAC', value: '00:1A:2B:3C:4D:5E' },
      { name: 'Destination MAC', value: '00:11:22:33:44:55' },
      { name: 'Type', value: 'IPv4' },
    ],
  },
  {
    layer: 1,
    name: 'Physical Layer',
    protocol: 'Bits',
    icon: <DatabaseOutlined />,
    fields: [
      { name: 'Signal', value: 'Electrical/Optical' },
      { name: 'Encoding', value: 'Manchester/NRZ' },
    ],
    hex: '54 43 50 49 50 20 44 41 54 41 ...',
  },
]

// 根据协议类型生成 OSI 数据
function generateOSIData(protocol: string, packetData?: any): OSILayer[] {
  if (!packetData) {
    return defaultOSIData
  }

  const layers: OSILayer[] = []

  // 根据协议添加相应的层
  if (protocol === 'tcp' || protocol === 'udp') {
    // 传输层
    layers.push({
      layer: 4,
      name: 'Transport Layer',
      protocol: protocol.toUpperCase(),
      icon: <ApiOutlined />,
      fields: [
        { name: 'Source Port', value: packetData.src_port || '0' },
        { name: 'Destination Port', value: packetData.dst_port || '0' },
        ...(protocol === 'tcp' ? [
          { name: 'Sequence Number', value: packetData.seq?.toString() || '0' },
          { name: 'Acknowledgment Number', value: packetData.ack?.toString() || '0' },
          { name: 'Flags', value: packetData.flags_text || 'ACK' },
          { name: 'Window Size', value: packetData.window_size?.toString() || '65535' },
        ] : [
          { name: 'Length', value: packetData.length?.toString() || '8' },
          { name: 'Checksum', value: packetData.checksum?.toString() || '0x0000' },
        ]),
      ],
    })
  }

  // 网络层
  layers.push({
    layer: 3,
    name: 'Network Layer',
    protocol: 'IP',
    icon: <CloudOutlined />,
    fields: [
      { name: 'Source IP', value: packetData.source || '192.168.1.10' },
      { name: 'Destination IP', value: packetData.destination || '192.168.1.1' },
      { name: 'Protocol', value: protocol.toUpperCase() },
      { name: 'TTL', value: '64' },
    ],
  })

  // 数据链路层
  layers.push({
    layer: 2,
    name: 'Data Link Layer',
    protocol: 'Ethernet',
    icon: <WifiOutlined />,
    fields: [
      { name: 'Source MAC', value: '00:1A:2B:3C:4D:5E' },
      { name: 'Destination MAC', value: '00:11:22:33:44:55' },
      { name: 'Type', value: 'IPv4 (0x0800)' },
    ],
  })

  // 物理层
  layers.push({
    layer: 1,
    name: 'Physical Layer',
    protocol: 'Bits',
    icon: <DatabaseOutlined />,
    fields: [
      { name: 'Medium', value: 'Twisted Pair' },
      { name: 'Speed', value: '1000 Mbps' },
    ],
    hex: generateHexDump(packetData),
  })

  return layers
}

// 生成十六进制转储
function generateHexDump(data: any): string {
  const str = JSON.stringify(data)
  const hex = Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()).join(' ')
  return hex.slice(0, 80) + (hex.length > 80 ? ' ...' : '')
}

export default function OSIPanel({ visible = true, data, protocol, packetData, onClose }: OSIPanelProps) {
  const [activeKey, setActiveKey] = useState<string[]>(['4'])
  const [osiData, setOsiData] = useState<OSILayer[]>(defaultOSIData)

  useEffect(() => {
    if (protocol) {
      setOsiData(generateOSIData(protocol, packetData))
    } else if (data) {
      setOsiData(data)
    }
  }, [protocol, packetData, data])

  if (!visible) return null

  return (
    <div className="osi-panel glass">
      <div className="osi-header">
        <Title level={5} className="osi-title">
          <DatabaseOutlined /> OSI 协议分析
        </Title>
        <div className="osi-header-actions">
          <Tag color="blue">{protocol?.toUpperCase() || 'TCP'}</Tag>
          {onClose && (
            <button className="osi-close" onClick={onClose}>
              <CloseOutlined />
            </button>
          )}
        </div>
      </div>

      <div className="osi-content">
        {osiData.length === 0 ? (
          <div className="osi-empty">
            <Empty description="暂无数据" />
            <Paragraph className="empty-hint">
              <CheckCircleOutlined /> 开始实验后，数据包将在这里显示各层协议详情
            </Paragraph>
          </div>
        ) : (
          <Collapse
            accordion
            activeKey={activeKey}
            onChange={(key) => setActiveKey(key as string[])}
            expandIcon={({ isActive }) => (
              <RightOutlined rotate={isActive ? 90 : 0} style={{ fontSize: 12 }} />
            )}
            className="osi-collapse"
          >
            {osiData.map((layer) => (
              <Panel
                header={
                  <div className="layer-header">
                    <div className="layer-icon">{layer.icon}</div>
                    <div className="layer-info">
                      <span className="layer-number">Layer {layer.layer}</span>
                      <span className="layer-name">{layer.name}</span>
                      <Tag className="layer-protocol-tag" color="blue">{layer.protocol}</Tag>
                    </div>
                  </div>
                }
                key={layer.layer.toString()}
                className="osi-panel-item"
              >
                <div className="layer-fields">
                  <table className="fields-table">
                    <tbody>
                      {layer.fields.map((field, index) => (
                        <tr key={index}>
                          <td className="field-name">{field.name}</td>
                          <td className="field-value">
                            <code>{field.value}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {layer.hex && (
                    <div className="hex-view">
                      <Text className="hex-label">Hex Dump:</Text>
                      <pre className="hex-code">{layer.hex}</pre>
                    </div>
                  )}
                </div>
              </Panel>
            ))}
          </Collapse>
        )}
      </div>
    </div>
  )
}
