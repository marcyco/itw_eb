import ProtocolLearningPage from '../ProtocolLearning'
import './index.css'

const httpSlides = [
  {
    title: 'HTTP：请求与响应模型',
    content: 'HTTP 采用请求 - 响应模型。客户端发送请求（包含方法、URL、Header），服务器返回响应（包含状态码、Header、Body）。常见方法有 GET、POST、PUT、DELETE。',
    diagram: (
      <div className="protocol-diagram http-flow">
        <div className="flow-participant client">
          <div className="participant-icon">🖥️</div>
          <div className="participant-name">客户端</div>
        </div>
        <div className="flow-arrows">
          <div className="flow-arrow request">
            <span>HTTP Request</span>
            <small>GET /index.html HTTP/1.1</small>
          </div>
          <div className="flow-arrow response">
            <span>HTTP Response</span>
            <small>HTTP/1.1 200 OK</small>
          </div>
        </div>
        <div className="flow-participant server">
          <div className="participant-icon">🖲️</div>
          <div className="participant-name">服务器</div>
        </div>
      </div>
    ),
  },
  {
    title: 'HTTP 请求报文结构',
    content: 'HTTP 请求由请求行、请求头、空行、请求体组成。请求行包含方法、URL 和协议版本。请求头传递额外信息，如 User-Agent、Accept 等。',
    diagram: (
      <div className="protocol-diagram message-structure">
        <div className="message-part">
          <div className="part-label">请求行</div>
          <code>GET /api/users HTTP/1.1</code>
        </div>
        <div className="message-part">
          <div className="part-label">请求头</div>
          <code>Host: example.com</code>
          <code>User-Agent: Mozilla/5.0</code>
          <code>Accept: application/json</code>
        </div>
        <div className="message-part">
          <div className="part-label">空行</div>
          <code>(空行)</code>
        </div>
        <div className="message-part">
          <div className="part-label">请求体</div>
          <code>{'{"name": "John", "age": 30}'}</code>
        </div>
      </div>
    ),
  },
  {
    title: 'HTTP 状态码与响应',
    content: '常见状态码：200 OK（成功）、201 Created（已创建）、301 Moved Permanently（永久重定向）、400 Bad Request（错误请求）、404 Not Found、500 Internal Server Error。',
    diagram: (
      <div className="protocol-diagram status-codes">
        <div className="status-group">
          <h4>2xx 成功</h4>
          <div className="status-item">200 OK</div>
          <div className="status-item">201 Created</div>
          <div className="status-item">204 No Content</div>
        </div>
        <div className="status-group">
          <h4>3xx 重定向</h4>
          <div className="status-item">301 Moved Permanently</div>
          <div className="status-item">302 Found</div>
          <div className="status-item">304 Not Modified</div>
        </div>
        <div className="status-group">
          <h4>4xx 客户端错误</h4>
          <div className="status-item">400 Bad Request</div>
          <div className="status-item">401 Unauthorized</div>
          <div className="status-item">404 Not Found</div>
        </div>
        <div className="status-group">
          <h4>5xx 服务器错误</h4>
          <div className="status-item">500 Internal Server Error</div>
          <div className="status-item">502 Bad Gateway</div>
          <div className="status-item">503 Service Unavailable</div>
        </div>
      </div>
    ),
  },
  {
    title: 'HTTPS：加密的 HTTP',
    content: 'HTTPS 在 HTTP 下加入 TLS/SSL 加密层。TLS 握手过程包括：ClientHello、ServerHello、Certificate 交换、密钥交换、Finished 确认，确保数据传输安全。',
    diagram: (
      <div className="protocol-diagram tls-handshake">
        <div className="handshake-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <strong>ClientHello</strong>
            <small>客户端发送支持的加密套件和 TLS 版本</small>
          </div>
        </div>
        <div className="handshake-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <strong>ServerHello</strong>
            <small>服务器选择加密套件和 TLS 版本</small>
          </div>
        </div>
        <div className="handshake-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <strong>Certificate</strong>
            <small>服务器发送 SSL/TLS 证书</small>
          </div>
        </div>
        <div className="handshake-step">
          <div className="step-number">4</div>
          <div className="step-content">
            <strong>Key Exchange</strong>
            <small>交换密钥材料</small>
          </div>
        </div>
        <div className="handshake-step">
          <div className="step-number">5</div>
          <div className="step-content">
            <strong>Finished</strong>
            <small>握手完成，开始加密通信</small>
          </div>
        </div>
      </div>
    ),
  },
]

export default function HTTPPage() {
  return (
    <ProtocolLearningPage
      protocol="http"
      title="HTTP 协议学习"
      slides={httpSlides}
      experimentConfig={{
        useHttps: false,
        serverPort: 80,
      }}
    />
  )
}
