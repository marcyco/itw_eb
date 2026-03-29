import ProtocolLearningPage from '../ProtocolLearning'
import './index.css'

const ftpSlides = [
  {
    title: 'FTP：双连接设计',
    content: 'FTP 使用两个独立连接：控制连接（端口 21）传输命令和响应，数据连接（端口 20）传输文件数据。这种带外控制的设计提高了灵活性和效率。',
    diagram: (
      <div className="protocol-diagram ftp-connections">
        <div className="connection-flow">
          <div className="endpoint client">
            <div className="endpoint-icon">🖥️</div>
            <div className="endpoint-name">客户端</div>
          </div>
          <div className="connection-lines">
            <div className="connection-line control">
              <span className="line-label">控制连接 (端口 21)</span>
              <div className="line-arrows">
                <span>USER, PASS, LIST, RETR, STOR</span>
              </div>
            </div>
            <div className="connection-line data">
              <span className="line-label">数据连接 (端口 20)</span>
              <div className="line-arrows">
                <span>文件数据流</span>
              </div>
            </div>
          </div>
          <div className="endpoint server">
            <div className="endpoint-icon">🖲️</div>
            <div className="endpoint-name">服务器</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'FTP 登录流程',
    content: '客户端首先建立控制连接，然后发送 USER 命令提供用户名，服务器响应 331 要求密码，客户端发送 PASS 命令，登录成功后返回 230。',
    diagram: (
      <div className="protocol-diagram ftp-login">
        <div className="login-step">
          <div className="step-client">客户端</div>
          <div className="step-arrow">→</div>
          <div className="step-command">USER admin</div>
          <div className="step-server">服务器</div>
        </div>
        <div className="login-step">
          <div className="step-client">客户端</div>
          <div className="step-arrow">←</div>
          <div className="step-response">331 Please specify the password</div>
          <div className="step-server">服务器</div>
        </div>
        <div className="login-step">
          <div className="step-client">客户端</div>
          <div className="step-arrow">→</div>
          <div className="step-command">PASS ******</div>
          <div className="step-server">服务器</div>
        </div>
        <div className="login-step">
          <div className="step-client">客户端</div>
          <div className="step-arrow">←</div>
          <div className="step-response success">230 Login successful</div>
          <div className="step-server">服务器</div>
        </div>
      </div>
    ),
  },
  {
    title: 'FTP 模式：主动 vs 被动',
    content: '主动模式 (PORT)：服务器主动连接客户端的数据端口 (20→客户端高位端口)。被动模式 (PASV)：客户端连接服务器的数据端口。被动模式适用于客户端在防火墙后的场景。',
    diagram: (
      <div className="protocol-diagram ftp-modes">
        <div className="mode-card">
          <h4>📤 主动模式 (PORT)</h4>
          <div className="mode-flow">
            <div className="flow-row">
              <span>客户端 → PORT 192,168,1,10,200,100 → 服务器</span>
            </div>
            <div className="flow-row highlight">
              <span>服务器 (20) → 连接 → 客户端 (51300)</span>
            </div>
          </div>
          <div className="mode-note">⚠️ 客户端防火墙可能阻止入站连接</div>
        </div>
        <div className="mode-card">
          <h4>📥 被动模式 (PASV)</h4>
          <div className="mode-flow">
            <div className="flow-row">
              <span>客户端 → PASV → 服务器</span>
            </div>
            <div className="flow-row">
              <span>客户端 ← 227 Entering Passive Mode ← 服务器</span>
            </div>
            <div className="flow-row highlight">
              <span>客户端 → 连接 → 服务器 (高位端口)</span>
            </div>
          </div>
          <div className="mode-note">✅ 适用于客户端在防火墙后</div>
        </div>
      </div>
    ),
  },
  {
    title: 'FTP 命令与响应码',
    content: '常见命令：USER、PASS、PWD、CWD、LIST、RETR、STOR、QUIT。响应码：2xx 成功、3xx 需要更多信息、4xx 临时错误、5xx 永久错误。',
    diagram: (
      <div className="protocol-diagram ftp-commands">
        <div className="commands-grid">
          <div className="command-category">
            <h4>认证命令</h4>
            <div className="command-item">
              <code>USER</code>
              <span>提供用户名</span>
            </div>
            <div className="command-item">
              <code>PASS</code>
              <span>提供密码</span>
            </div>
          </div>
          <div className="command-category">
            <h4>文件操作</h4>
            <div className="command-item">
              <code>RETR</code>
              <span>下载文件</span>
            </div>
            <div className="command-item">
              <code>STOR</code>
              <span>上传文件</span>
            </div>
            <div className="command-item">
              <code>LIST</code>
              <span>列出目录</span>
            </div>
          </div>
          <div className="command-category">
            <h4>常见响应码</h4>
            <div className="command-item">
              <code>230</code>
              <span>登录成功</span>
            </div>
            <div className="command-item">
              <code>226</code>
              <span>传输完成</span>
            </div>
            <div className="command-item">
              <code>550</code>
              <span>文件未找到</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'FTP 文件传输过程',
    content: '建立数据连接后，客户端发送 RETR 或 STOR 命令开始传输。数据以二进制或 ASCII 模式传输。传输完成后关闭数据连接，控制连接保持。',
    diagram: (
      <div className="protocol-diagram ftp-transfer">
        <div className="transfer-stage">
          <div className="stage-number">1</div>
          <div className="stage-desc">建立控制连接 (21 端口)</div>
        </div>
        <div className="transfer-arrow">→</div>
        <div className="transfer-stage">
          <div className="stage-number">2</div>
          <div className="stage-desc">登录认证 (USER/PASS)</div>
        </div>
        <div className="transfer-arrow">→</div>
        <div className="transfer-stage">
          <div className="stage-number">3</div>
          <div className="stage-desc">协商数据连接 (PORT/PASV)</div>
        </div>
        <div className="transfer-arrow">→</div>
        <div className="transfer-stage">
          <div className="stage-number">4</div>
          <div className="stage-desc">传输文件 (RETR/STOR)</div>
        </div>
        <div className="transfer-arrow">→</div>
        <div className="transfer-stage">
          <div className="stage-number">5</div>
          <div className="stage-desc">关闭数据连接，返回 226</div>
        </div>
      </div>
    ),
  },
]

export default function FTPPage() {
  return (
    <ProtocolLearningPage
      protocol="ftp"
      title="FTP 协议学习"
      slides={ftpSlides}
      experimentConfig={{
        mode: 'passive',
        dataPort: 20,
      }}
    />
  )
}
