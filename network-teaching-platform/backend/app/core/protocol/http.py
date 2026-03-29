"""
HTTP 协议模拟
实现请求/响应模型、状态码、TLS 握手等功能
"""
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
import json
import time
import hashlib
import secrets
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
import uuid


class HTTPMethod:
    """HTTP 方法"""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"
    PATCH = "PATCH"


class HTTPStatus:
    """HTTP 状态码"""
    # 1xx Informational
    CONTINUE = 100
    SWITCHING_PROTOCOLS = 101

    # 2xx Success
    OK = 200
    CREATED = 201
    ACCEPTED = 202
    NO_CONTENT = 204

    # 3xx Redirection
    MOVED_PERMANENTLY = 301
    FOUND = 302
    SEE_OTHER = 303
    NOT_MODIFIED = 304
    TEMPORARY_REDIRECT = 307

    # 4xx Client Error
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    METHOD_NOT_ALLOWED = 405
    CONFLICT = 409
    UNPROCESSABLE_ENTITY = 422
    TOO_MANY_REQUESTS = 429

    # 5xx Server Error
    INTERNAL_ERROR = 500
    NOT_IMPLEMENTED = 501
    BAD_GATEWAY = 502
    SERVICE_UNAVAILABLE = 503


@dataclass
class Cookie:
    """HTTP Cookie"""
    name: str
    value: str
    expires: int = None  # Unix timestamp
    path: str = "/"
    domain: str = None
    secure: bool = False
    http_only: bool = True
    same_site: str = "Lax"  # Strict, Lax, None

    def to_header(self) -> str:
        """转换为 Set-Cookie 头部"""
        parts = [f"{self.name}={self.value}"]
        if self.expires:
            from datetime import datetime
            dt = datetime.utcfromtimestamp(self.expires)
            parts.append(f"Expires={dt.strftime('%a, %d %b %Y %H:%M:%S GMT')}")
        if self.path:
            parts.append(f"Path={self.path}")
        if self.domain:
            parts.append(f"Domain={self.domain}")
        if self.secure:
            parts.append("Secure")
        if self.http_only:
            parts.append("HttpOnly")
        if self.same_site != "Lax":
            parts.append(f"SameSite={self.same_site}")
        return "; ".join(parts)


@dataclass
class Session:
    """服务器会话"""
    id: str
    data: Dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)
    expires_at: Optional[float] = None

    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        return time.time() > self.expires_at


class SessionManager:
    """会话管理器"""

    def __init__(self, expire_minutes: int = 30):
        self.sessions: Dict[str, Session] = {}
        self.expire_minutes = expire_minutes

    def create_session(self) -> Session:
        """创建新会话"""
        session_id = secrets.token_urlsafe(32)
        session = Session(
            id=session_id,
            expires_at=time.time() + (self.expire_minutes * 60)
        )
        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[Session]:
        """获取会话"""
        session = self.sessions.get(session_id)
        if session and session.is_expired():
            del self.sessions[session_id]
            return None
        return session

    def delete_session(self, session_id: str):
        """删除会话"""
        if session_id in self.sessions:
            del self.sessions[session_id]


class HTTPMiddleware:
    """HTTP 中间件基类"""

    def process_request(self, request: Packet) -> Optional[Packet]:
        """处理请求，返回 None 表示继续处理"""
        pass

    def process_response(self, response: Packet) -> Packet:
        """处理响应"""
        return response


class LoggingMiddleware(HTTPMiddleware):
    """日志中间件"""

    def __init__(self):
        self.logs = []

    def process_request(self, request: Packet) -> Optional[Packet]:
        log_entry = {
            "timestamp": time.time(),
            "method": request.data.get("method"),
            "url": request.data.get("url"),
        }
        self.logs.append(log_entry)
        return None


class CORSMiddleware(HTTPMiddleware):
    """CORS 中间件"""

    def __init__(self, allowed_origins: List[str] = None):
        self.allowed_origins = allowed_origins or ["*"]

    def process_response(self, response: Packet) -> Packet:
        headers = response.data.get("headers", {})
        headers["Access-Control-Allow-Origin"] = self.allowed_origins[0] if self.allowed_origins else "*"
        headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.data["headers"] = headers
        return response


class RateLimitMiddleware(HTTPMiddleware):
    """限流中间件"""

    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = {}

    def process_request(self, request: Packet) -> Optional[Packet]:
        client_ip = request.source
        current_time = time.time()

        if client_ip not in self.requests:
            self.requests[client_ip] = []

        # 清理过期请求
        self.requests[client_ip] = [
            t for t in self.requests[client_ip]
            if current_time - t < self.window_seconds
        ]

        if len(self.requests[client_ip]) >= self.max_requests:
            # 返回 429 Too Many Requests
            return Packet(
                protocol=ProtocolType.HTTP,
                data={
                    "type": "response",
                    "status": 429,
                    "headers": {"Content-Type": "application/json", "Retry-After": str(self.window_seconds)},
                    "body": {"error": "Too Many Requests"},
                },
                source="server",
                destination="client",
            )

        self.requests[client_ip].append(current_time)
        return None


class HTTPProtocol(BaseProtocol):
    """HTTP 协议模拟器"""

    def __init__(self):
        super().__init__()
        self.use_https = False
        self.routes: Dict[str, Dict[str, Callable]] = {}
        self.middlewares: List[HTTPMiddleware] = []
        self.session_manager = SessionManager()

        # 注册默认路由
        self.register_default_routes()

    def register_default_routes(self):
        """注册默认路由"""
        self.routes = {
            "/api/data": {
                "GET": lambda req: (200, {"data": "Success", "items": [1, 2, 3]}),
                "POST": lambda req: (201, {"data": "Created", "id": 1}),
            },
            "/api/submit": {
                "POST": lambda req: (200, {"data": "Submitted", "received": req.data.get("body")}),
            },
            "/api/users": {
                "GET": lambda req: (200, {"users": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]}),
                "POST": lambda req: (201, {"data": "User created", "user": req.data.get("body")}),
            },
            "/api/login": {
                "POST": lambda req: self._handle_login(req),
            },
            "/api/logout": {
                "POST": lambda req: self._handle_logout(req),
            },
        }

    def _handle_login(self, request: Packet) -> tuple:
        """处理登录请求"""
        body = request.data.get("body", {})
        username = body.get("username")
        password = body.get("password")

        if not username or not password:
            return (400, {"error": "Missing credentials"})

        # 简单验证（实际应用中应该查询数据库）
        if username == "admin" and password == "admin":
            session = self.session_manager.create_session()
            session.data["user_id"] = 1
            session.data["username"] = username

            cookie = Cookie(
                name="session_id",
                value=session.id,
                expires=int(session.expires_at),
                http_only=True,
                secure=self.use_https,
            )

            return (200, {
                "data": "Login successful",
                "user": {"id": 1, "username": username},
                "set_cookie": cookie.to_header(),
            })

        return (401, {"error": "Invalid credentials"})

    def _handle_logout(self, request: Packet) -> tuple:
        """处理登出请求"""
        # 从 Cookie 获取 session_id
        headers = request.data.get("headers", {})
        cookie_header = headers.get("Cookie", "")

        session_id = None
        for cookie in cookie_header.split(";"):
            if "session_id=" in cookie:
                session_id = cookie.split("=")[1].strip()
                break

        if session_id:
            self.session_manager.delete_session(session_id)

        return (200, {"data": "Logout successful"})

    def use(self, middleware: HTTPMiddleware):
        """注册中间件"""
        self.middlewares.append(middleware)

    def route(self, path: str, methods: List[str] = None):
        """路由装饰器"""
        def decorator(func):
            if path not in self.routes:
                self.routes[path] = {}
            for method in (methods or ["GET"]):
                self.routes[path][method.upper()] = func
            return func
        return decorator
    
    def create_request(self, method: str, url: str, headers: Dict[str, str] = None, body: Any = None) -> Packet:
        """创建 HTTP 请求"""
        request_line = f"{method} {url} HTTP/1.1"
        header_lines = [f"{k}: {v}" for k, v in (headers or {}).items()]
        header_text = "\r\n".join(header_lines)
        body_text = json.dumps(body) if body else ""
        
        raw = f"{request_line}\r\n{header_text}\r\n\r\n{body_text}"
        
        packet = Packet(
            protocol=ProtocolType.HTTP,
            data={
                "type": "request",
                "method": method,
                "url": url,
                "headers": headers or {},
                "body": body,
                "raw": raw,
            },
            source="client",
            destination="server",
        )
        self.packets.append(packet)
        return packet
    
    def create_response(self, status: int, headers: Dict[str, str] = None, body: Any = None) -> Packet:
        """创建 HTTP 响应"""
        status_text = {
            200: "OK",
            201: "Created",
            400: "Bad Request",
            401: "Unauthorized",
            404: "Not Found",
            500: "Internal Server Error",
            501: "Not Implemented",
        }
        status_line = f"HTTP/1.1 {status} {status_text.get(status, 'Unknown')}"
        header_lines = [f"{k}: {v}" for k, v in (headers or {}).items()]
        header_text = "\r\n".join(header_lines)
        body_text = json.dumps(body) if body else ""
        
        raw = f"{status_line}\r\n{header_text}\r\n\r\n{body_text}"
        
        packet = Packet(
            protocol=ProtocolType.HTTP,
            data={
                "type": "response",
                "status": status,
                "headers": headers or {},
                "body": body,
                "raw": raw,
            },
            source="server",
            destination="client",
        )
        self.packets.append(packet)
        return packet
    
    def handle_request(self, request: Packet) -> Packet:
        """处理 HTTP 请求"""
        method = request.data.get("method", "GET")
        url = request.data.get("url", "/")

        # 通过中间件处理请求
        for middleware in self.middlewares:
            result = middleware.process_request(request)
            if result:  # 中间件返回了响应，直接返回
                return self.create_response(
                    result.data["status"],
                    result.data.get("headers", {}),
                    result.data.get("body")
                )

        # 查找路由
        if url in self.routes:
            route_handlers = self.routes[url]
            if method in route_handlers:
                handler = route_handlers[method]
                try:
                    status, body = handler(request)
                    headers = {"Content-Type": "application/json"}

                    # 处理 Set-Cookie
                    if isinstance(body, dict) and "set_cookie" in body:
                        headers["Set-Cookie"] = body.pop("set_cookie")

                    response = self.create_response(status, headers, body)

                    # 通过中间件处理响应
                    for middleware in self.middlewares:
                        response = middleware.process_response(response)

                    return response
                except Exception as e:
                    return self.create_response(500, {"Content-Type": "application/json"}, {"error": str(e)})
            else:
                return self.create_response(405, {"Content-Type": "application/json"}, {"error": "Method Not Allowed"})
        elif url == "/nonexistent":
            return self.create_response(404, {"Content-Type": "text/plain"}, {"error": "Not Found"})
        else:
            return self.create_response(404, {"Content-Type": "application/json"}, {"error": "Not Found", "url": url})
    
    def tls_handshake(self) -> List[Dict[str, str]]:
        """
        TLS 握手过程
        
        1. ClientHello - 客户端发送支持的加密套件
        2. ServerHello - 服务器选择加密套件
        3. Certificate - 服务器发送证书
        4. ServerKeyExchange - 密钥交换
        5. ServerHelloDone - 服务器握手完成
        6. ClientKeyExchange - 客户端密钥交换
        7. ChangeCipherSpec - 切换加密
        8. Finished - 握手完成
        """
        return [
            {"step": "1", "name": "ClientHello", "description": "客户端发送支持的加密套件和 TLS 版本"},
            {"step": "2", "name": "ServerHello", "description": "服务器选择加密套件和 TLS 版本"},
            {"step": "3", "name": "Certificate", "description": "服务器发送 SSL/TLS 证书"},
            {"step": "4", "name": "ServerKeyExchange", "description": "服务器发送密钥交换参数"},
            {"step": "5", "name": "ServerHelloDone", "description": "服务器握手消息发送完毕"},
            {"step": "6", "name": "ClientKeyExchange", "description": "客户端发送密钥交换参数"},
            {"step": "7", "name": "ChangeCipherSpec", "description": "客户端切换到加密通信"},
            {"step": "8", "name": "Finished", "description": "客户端握手完成验证"},
            {"step": "9", "name": "ChangeCipherSpec", "description": "服务器切换到加密通信"},
            {"step": "10", "name": "Finished", "description": "服务器握手完成验证"},
        ]
    
    def process_packet(self, packet: Packet) -> Dict[str, Any]:
        """处理 HTTP 数据包"""
        if packet.data.get("type") == "request":
            response = self.handle_request(packet)
            return {
                "accepted": True,
                "response": response.data,
            }
        return {"accepted": True}
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据（应用层）"""
        layers = [
            {
                "layer": 7,
                "name": "Application Layer",
                "protocol": "HTTP",
                "fields": packet.data,
                "raw": packet.data.get("raw", ""),
            }
        ]
        
        if self.use_https:
            layers.insert(0, {
                "layer": 6,
                "name": "Presentation Layer",
                "protocol": "TLS",
                "fields": {"encrypted": True, "version": "TLS 1.3"},
            })
        
        return layers
    
    def _to_hex(self, data: Dict) -> str:
        """转换为十六进制字符串（简化版）"""
        return "48 54 54 50 ..."
