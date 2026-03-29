-- NetLab 数据库初始化脚本
-- MySQL 5.7+

-- 创建数据库
CREATE DATABASE IF NOT EXISTS network_teaching 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE network_teaching;

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 实验表
-- ============================================
CREATE TABLE experiments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    protocol_type VARCHAR(50) NOT NULL,
    topology_data JSON,
    config JSON,
    owner_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_protocol_type (protocol_type),
    INDEX idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 拓扑表
-- ============================================
CREATE TABLE topologies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    nodes JSON NOT NULL,
    connections JSON NOT NULL,
    owner_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 会话表
-- ============================================
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 实验记录表
-- ============================================
CREATE TABLE experiment_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    experiment_id INT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 数据包记录表
-- ============================================
CREATE TABLE packets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    experiment_id INT,
    packet_id VARCHAR(100) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL,
    destination VARCHAR(50) NOT NULL,
    data JSON NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_protocol (protocol),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 插入测试数据
-- ============================================

-- 测试用户 (密码：123456，使用 bcrypt 加密)
-- 注意：实际使用时请生成新的哈希值
INSERT INTO users (username, email, hashed_password) VALUES 
('admin', 'admin@netlab.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('test', 'test@netlab.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');

-- 测试拓扑 - TCP 实验
INSERT INTO topologies (name, description, nodes, connections, owner_id) VALUES
('TCP 基础拓扑', '客户端 - 服务器点对点连接', 
 '{"nodes": [{"id": "client", "type": "host", "config": {"ip": "192.168.1.10"}, "position": {"x": 100, "y": 100}}, {"id": "server", "type": "host", "config": {"ip": "192.168.1.1"}, "position": {"x": 400, "y": 100}}]}',
 '{"connections": [{"id": "conn1", "source": "client", "destination": "server", "source_port": "eth0", "dest_port": "eth0", "status": "active"}]}',
 1);

-- 测试拓扑 - UDP 广播
INSERT INTO topologies (name, description, nodes, connections, owner_id) VALUES
('UDP 广播拓扑', '主机 A 向主机 B 和 C 广播', 
 '{"nodes": [
    {"id": "hostA", "type": "host", "config": {"ip": "192.168.1.10"}, "position": {"x": 100, "y": 100}},
    {"id": "hostB", "type": "host", "config": {"ip": "192.168.1.20"}, "position": {"x": 400, "y": 50}},
    {"id": "hostC", "type": "host", "config": {"ip": "192.168.1.30"}, "position": {"x": 400, "y": 150}}
 ]}',
 '{"connections": [
    {"id": "conn1", "source": "hostA", "destination": "hostB", "source_port": "eth0", "dest_port": "eth0"},
    {"id": "conn2", "source": "hostA", "destination": "hostC", "source_port": "eth0", "dest_port": "eth0"}
 ]}',
 1);

-- 测试拓扑 - RIP 路由
INSERT INTO topologies (name, description, nodes, connections, owner_id) VALUES
('RIP 路由拓扑', '三路由器串联', 
 '{"nodes": [
    {"id": "R1", "type": "router", "config": {"interfaces": [{"name": "eth0", "ip": "192.168.1.1"}]}, "position": {"x": 100, "y": 100}},
    {"id": "R2", "type": "router", "config": {"interfaces": [{"name": "eth0", "ip": "192.168.2.1"}, {"name": "eth1", "ip": "192.168.1.2"}]}, "position": {"x": 300, "y": 100}},
    {"id": "R3", "type": "router", "config": {"interfaces": [{"name": "eth0", "ip": "192.168.2.2"}]}, "position": {"x": 500, "y": 100}}
 ]}',
 '{"connections": [
    {"id": "conn1", "source": "R1", "destination": "R2", "source_port": "eth0", "dest_port": "eth1"},
    {"id": "conn2", "source": "R2", "destination": "R3", "source_port": "eth0", "dest_port": "eth0"}
 ]}',
 1);

-- 测试实验 - TCP 三次握手
INSERT INTO experiments (title, description, protocol_type, topology_data, config, owner_id) VALUES
('TCP 三次握手实验', '学习 TCP 连接建立过程', 'tcp', 
 '{"nodes": [{"id": "client", "type": "host", "position": {"x": 100, "y": 100}}, {"id": "server", "type": "host", "position": {"x": 400, "y": 100}}], "connections": [{"id": "conn1", "source": "client", "destination": "server"}]}',
 '{"window_size": 3, "simulate_loss": false, "congestion_control": "reno"}',
 1);

-- 测试实验 - HTTP 请求
INSERT INTO experiments (title, description, protocol_type, topology_data, config, owner_id) VALUES
('HTTP 请求响应实验', '学习 HTTP 请求响应模型', 'http',
 '{"nodes": [{"id": "browser", "type": "browser", "position": {"x": 100, "y": 100}}, {"id": "webserver", "type": "server", "position": {"x": 400, "y": 100}}], "connections": [{"id": "conn1", "source": "browser", "destination": "webserver"}]}',
 '{"use_https": false, "server_port": 80}',
 1);

-- ============================================
-- 视图和存储过程（可选）
-- ============================================

-- 创建用户实验统计视图
CREATE OR REPLACE VIEW user_experiment_stats AS
SELECT 
    u.id AS user_id,
    u.username,
    COUNT(e.id) AS total_experiments,
    SUM(CASE WHEN e.protocol_type = 'tcp' THEN 1 ELSE 0 END) AS tcp_experiments,
    SUM(CASE WHEN e.protocol_type = 'udp' THEN 1 ELSE 0 END) AS udp_experiments,
    SUM(CASE WHEN e.protocol_type = 'http' THEN 1 ELSE 0 END) AS http_experiments,
    SUM(CASE WHEN e.protocol_type = 'rip' THEN 1 ELSE 0 END) AS rip_experiments,
    SUM(CASE WHEN e.protocol_type = 'ftp' THEN 1 ELSE 0 END) AS ftp_experiments
FROM users u
LEFT JOIN experiments e ON u.id = e.owner_id
GROUP BY u.id, u.username;

-- ============================================
-- 验证
-- ============================================

-- 显示所有表
SHOW TABLES;

-- 显示测试用户
SELECT id, username, email, created_at FROM users;

-- 显示测试拓扑
SELECT id, name, description FROM topologies;

-- 显示测试实验
SELECT id, title, protocol_type FROM experiments;
