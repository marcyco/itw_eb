"""
FTP 协议实验 API 路由
"""
from fastapi import APIRouter
from typing import List

from app.core.protocol.ftp import FTPProtocol, FTPMode

router = APIRouter(tags=["FTP 实验"])


@router.post("/login")
async def ftp_login(username: str, password: str):
    """
    模拟 FTP 登录
    
    - **username**: 用户名
    - **password**: 密码
    """
    protocol = FTPProtocol()
    packets = protocol.login(username, password)
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": p.data,
                "source": p.source,
                "destination": p.destination,
            }
            for p in packets
        ]
    }


@router.post("/data-connection")
async def ftp_data_connection(mode: str = FTPMode.ACTIVE):
    """
    建立数据连接
    
    - **mode**: 模式 (active/passive)
    """
    protocol = FTPProtocol()
    steps = protocol.setup_data_connection(mode)
    return {"steps": steps}


@router.post("/upload")
async def ftp_upload(filename: str, content: str = ""):
    """
    模拟文件上传
    
    - **filename**: 文件名
    - **content**: 文件内容
    """
    protocol = FTPProtocol()
    packets = protocol.upload_file(filename, content.encode())
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": p.data,
            }
            for p in packets
        ]
    }


@router.post("/download")
async def ftp_download(filename: str):
    """
    模拟文件下载
    
    - **filename**: 文件名
    """
    protocol = FTPProtocol()
    packets = protocol.download_file(filename)
    return {
        "packets": [
            {
                "id": p.id,
                "protocol": p.protocol.value,
                "data": p.data,
            }
            for p in packets
        ]
    }
