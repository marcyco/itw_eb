/**
 * Cisco Packet Tracer 风格图标组件
 * 图标来源：https://igoutu.cn/icons/set/cisco-packet-tracer-pc
 */

// 主机/PC 图标
export function CiscoPcIcon({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 显示器 */}
      <rect x="8" y="8" width="48" height="36" rx="2" fill="#1a1a2e" stroke="#4a9eff" strokeWidth="2"/>
      <rect x="12" y="12" width="40" height="28" rx="1" fill="#0d0d14" stroke="#4a9eff" strokeWidth="1"/>
      {/* 屏幕内容 */}
      <rect x="16" y="16" width="32" height="20" rx="1" fill="#1a3a5c" opacity="0.6"/>
      <circle cx="32" cy="26" r="6" fill="#4a9eff" opacity="0.4"/>
      {/* 支架 */}
      <rect x="28" y="44" width="8" height="6" fill="#4a9eff"/>
      <rect x="24" y="50" width="16" height="4" rx="1" fill="#4a9eff"/>
      {/* 指示灯 */}
      <circle cx="46" cy="40" r="2" fill="#30d158"/>
    </svg>
  )
}

// 路由器图标
export function CiscoRouterIcon({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 主体 */}
      <rect x="8" y="20" width="48" height="28" rx="3" fill="#1a1a2e" stroke="#ff9500" strokeWidth="2"/>
      {/* 前面板 */}
      <rect x="12" y="24" width="40" height="20" rx="2" fill="#0d0d14" stroke="#ff9500" strokeWidth="1"/>
      {/* 端口 */}
      <circle cx="18" cy="34" r="3" fill="#ff9500" opacity="0.8"/>
      <circle cx="28" cy="34" r="3" fill="#ff9500" opacity="0.8"/>
      <circle cx="38" cy="34" r="3" fill="#ff9500" opacity="0.8"/>
      <circle cx="48" cy="34" r="3" fill="#ff9500" opacity="0.8"/>
      {/* 天线 */}
      <rect x="14" y="12" width="3" height="10" fill="#ff9500"/>
      <rect x="47" y="12" width="3" height="10" fill="#ff9500"/>
      <circle cx="15.5" cy="10" r="2" fill="#ff9500"/>
      <circle cx="48.5" cy="10" r="2" fill="#ff9500"/>
      {/* 指示灯 */}
      <circle cx="16" cy="48" r="1.5" fill="#30d158"/>
      <circle cx="22" cy="48" r="1.5" fill="#30d158"/>
      <circle cx="28" cy="48" r="1.5" fill="#ffd60a"/>
    </svg>
  )
}

// 交换机图标
export function CiscoSwitchIcon({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 主体 */}
      <rect x="8" y="22" width="48" height="24" rx="2" fill="#1a1a2e" stroke="#30d158" strokeWidth="2"/>
      {/* 前面板 */}
      <rect x="12" y="26" width="40" height="16" rx="1" fill="#0d0d14" stroke="#30d158" strokeWidth="1"/>
      {/* 端口 - 更多端口 */}
      <circle cx="16" cy="34" r="2.5" fill="#30d158" opacity="0.9"/>
      <circle cx="22" cy="34" r="2.5" fill="#30d158" opacity="0.9"/>
      <circle cx="28" cy="34" r="2.5" fill="#30d158" opacity="0.9"/>
      <circle cx="34" cy="34" r="2.5" fill="#30d158" opacity="0.9"/>
      <circle cx="40" cy="34" r="2.5" fill="#30d158" opacity="0.9"/>
      <circle cx="46" cy="34" r="2.5" fill="#30d158" opacity="0.9"/>
      {/* 指示灯 */}
      <circle cx="16" cy="42" r="1" fill="#30d158"/>
      <circle cx="22" cy="42" r="1" fill="#30d158"/>
      <circle cx="28" cy="42" r="1" fill="#32d74b"/>
      <circle cx="34" cy="42" r="1" fill="#32d74b"/>
    </svg>
  )
}

// 云图标
export function CiscoCloudIcon({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 云朵主体 */}
      <ellipse cx="32" cy="32" rx="24" ry="18" fill="#1a1a2e" stroke="#bf5af2" strokeWidth="2"/>
      <ellipse cx="24" cy="28" rx="10" ry="8" fill="#0d0d14" stroke="#bf5af2" strokeWidth="1"/>
      <ellipse cx="40" cy="28" rx="10" ry="8" fill="#0d0d14" stroke="#bf5af2" strokeWidth="1"/>
      <ellipse cx="32" cy="36" rx="14" ry="10" fill="#0d0d14" stroke="#bf5af2" strokeWidth="1"/>
      {/* 云内部装饰 */}
      <circle cx="28" cy="30" r="3" fill="#bf5af2" opacity="0.4"/>
      <circle cx="36" cy="30" r="3" fill="#bf5af2" opacity="0.4"/>
      <circle cx="32" cy="38" r="4" fill="#bf5af2" opacity="0.3"/>
      {/* 连接点 */}
      <circle cx="20" cy="32" r="2" fill="#e0a6ff"/>
      <circle cx="44" cy="32" r="2" fill="#e0a6ff"/>
      <circle cx="32" cy="22" r="2" fill="#e0a6ff"/>
      <circle cx="32" cy="46" r="2" fill="#e0a6ff"/>
    </svg>
  )
}

// 服务器图标（可选）
export function CiscoServerIcon({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 服务器主体 */}
      <rect x="16" y="12" width="32" height="44" rx="2" fill="#1a1a2e" stroke="#4a9eff" strokeWidth="2"/>
      {/* 机架层 */}
      <rect x="20" y="18" width="24" height="6" rx="1" fill="#0d0d14" stroke="#4a9eff" strokeWidth="1"/>
      <rect x="20" y="28" width="24" height="6" rx="1" fill="#0d0d14" stroke="#4a9eff" strokeWidth="1"/>
      <rect x="20" y="38" width="24" height="6" rx="1" fill="#0d0d14" stroke="#4a9eff" strokeWidth="1"/>
      <rect x="20" y="48" width="24" height="6" rx="1" fill="#0d0d14" stroke="#4a9eff" strokeWidth="1"/>
      {/* 指示灯 */}
      <circle cx="40" cy="21" r="1.5" fill="#30d158"/>
      <circle cx="40" cy="31" r="1.5" fill="#30d158"/>
      <circle cx="40" cy="41" r="1.5" fill="#ffd60a"/>
      <circle cx="40" cy="51" r="1.5" fill="#30d158"/>
    </svg>
  )
}

// 导出所有图标
export const CiscoIcons = {
  host: CiscoPcIcon,
  router: CiscoRouterIcon,
  switch: CiscoSwitchIcon,
  cloud: CiscoCloudIcon,
  server: CiscoServerIcon,
}
