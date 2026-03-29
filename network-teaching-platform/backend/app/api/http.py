"""
HTTP 协议实验 API 路由
"""
from fastapi import APIRouter
from typing import Dict, Any, Optional

from app.core.protocol.http import HTTPProtocol, HTTPMethod, HTTPStatus

router = APIRouter(tags=["HTTP 实验"])


@router.post("/request")
async def http_request(
    method: str = "GET",
    url: str = "/api/data",
    headers: Optional[Dict[str, str]] = None,
    body: Optional[Any] = None
):
    """
    模拟 HTTP 请求/响应
    
    - **method**: HTTP 方法 (GET/POST/PUT/DELETE)
    - **url**: 请求 URL
    - **headers**: 请求头
    - **body**: 请求体
    """
    protocol = HTTPProtocol()
    request = protocol.create_request(method, url, headers, body)
    response = protocol.handle_request(request)
    return {
        "request": {
            "id": request.id,
            "protocol": request.protocol.value,
            "data": {
                "type": request.data["type"],
                "method": request.data["method"],
                "url": request.data["url"],
                "headers": request.data["headers"],
                "body": request.data["body"],
                "raw": request.data["raw"],
            },
            "source": request.source,
            "destination": request.destination,
        },
        "response": {
            "id": response.id,
            "protocol": response.protocol.value,
            "data": {
                "type": response.data["type"],
                "status": response.data["status"],
                "headers": response.data["headers"],
                "body": response.data["body"],
                "raw": response.data["raw"],
            },
            "source": response.source,
            "destination": response.destination,
        }
    }


@router.get("/tls-handshake")
async def tls_handshake():
    """
    获取 TLS 握手过程
    """
    protocol = HTTPProtocol()
    return {"steps": protocol.tls_handshake()}
