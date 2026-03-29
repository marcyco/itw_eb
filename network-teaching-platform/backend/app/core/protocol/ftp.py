"""
FTP 协议模拟
实现控制连接、数据连接、主动/被动模式等功能
"""
from typing import Dict, Any, List
from app.core.protocol.base import BaseProtocol, Packet, ProtocolType
import uuid


class FTPMode:
    """FTP 模式"""
    ACTIVE = "active"  # 主动模式
    PASSIVE = "passive"  # 被动模式


class FTPCommand:
    """FTP 命令"""
    USER = "USER"
    PASS = "PASS"
    LIST = "LIST"
    RETR = "RETR"
    STOR = "STOR"
    QUIT = "QUIT"
    PORT = "PORT"
    PASV = "PASV"
    PWD = "PWD"
    CWD = "CWD"
    TYPE = "TYPE"


class FTPResponse:
    """FTP 响应码"""
    OK = 200
    READY = 150
    LOGIN_SUCCESS = 230
    FILE_NOT_FOUND = 550
    PASSWORD_REQUIRED = 331
    NEED_ACCOUNT = 332
    SERVICE_READY = 220
    CLOSING = 221
    DATA_OPEN = 125
    TRANSFER_COMPLETE = 226


class FTPProtocol(BaseProtocol):
    """FTP 协议模拟器"""
    
    def __init__(self):
        super().__init__()
        self.control_port = 21
        self.data_port = 20
        self.mode = FTPMode.ACTIVE
        self.session_data: Dict[str, Any] = {}
        self.current_user = None
        self.logged_in = False
    
    def create_command_packet(self, command: str, argument: str = "") -> Packet:
        """创建 FTP 命令包"""
        raw = f"{command} {argument}".strip()
        
        packet = Packet(
            protocol=ProtocolType.FTP,
            data={
                "type": "command",
                "command": command,
                "argument": argument,
                "raw": raw,
            },
            source="client",
            destination="server",
        )
        self.packets.append(packet)
        return packet
    
    def create_response_packet(self, code: int, message: str) -> Packet:
        """创建 FTP 响应包"""
        raw = f"{code} {message}"
        
        packet = Packet(
            protocol=ProtocolType.FTP,
            data={
                "type": "response",
                "code": code,
                "message": message,
                "raw": raw,
            },
            source="server",
            destination="client",
        )
        self.packets.append(packet)
        return packet
    
    def login(self, username: str, password: str) -> List[Packet]:
        """
        FTP 登录流程
        
        1. Client: USER <username>
        2. Server: 331 Password required
        3. Client: PASS <password>
        4. Server: 230 Login successful
        """
        packets = []
        
        # USER 命令
        user_cmd = self.create_command_packet(FTPCommand.USER, username)
        packets.append(user_cmd)
        
        # 331 响应
        resp1 = self.create_response_packet(FTPResponse.PASSWORD_REQUIRED, "Password required")
        packets.append(resp1)
        
        # PASS 命令
        pass_cmd = self.create_command_packet(FTPCommand.PASS, password)
        packets.append(pass_cmd)
        
        # 230 响应
        resp2 = self.create_response_packet(FTPResponse.LOGIN_SUCCESS, "Login successful")
        packets.append(resp2)
        
        self.session_data["username"] = username
        self.logged_in = True
        self.current_user = username
        
        return packets
    
    def setup_data_connection(self, mode: str = FTPMode.ACTIVE) -> List[Dict[str, str]]:
        """
        建立数据连接
        
        主动模式 (PORT):
        1. 客户端发送 PORT 命令告知数据端口
        2. 服务器主动连接客户端数据端口
        
        被动模式 (PASV):
        1. 客户端发送 PASV 命令
        2. 服务器返回被动模式端口
        3. 客户端连接服务器数据端口
        """
        self.mode = mode
        packets = []
        
        if mode == FTPMode.ACTIVE:
            # 主动模式流程
            return [
                {"step": "1", "action": "PORT command", "description": "客户端发送 PORT 命令告知数据端口 (如 PORT 192,168,1,10,200,80)"},
                {"step": "2", "action": "Server connects", "description": "服务器主动连接客户端数据端口 (服务器端口 20 -> 客户端端口)"},
                {"step": "3", "action": "Data transfer", "description": "通过数据连接传输文件或目录列表"},
            ]
        else:
            # 被动模式流程
            return [
                {"step": "1", "action": "PASV command", "description": "客户端发送 PASV 命令"},
                {"step": "2", "action": "Server responds", "description": "服务器返回 227 Entering Passive Mode (h1,h2,h3,h4,p1,p2)"},
                {"step": "3", "action": "Client connects", "description": "客户端连接服务器数据端口 (端口 = p1*256+p2)"},
                {"step": "4", "action": "Data transfer", "description": "通过数据连接传输文件或目录列表"},
            ]
    
    def upload_file(self, filename: str, data: bytes = b"") -> List[Packet]:
        """
        上传文件
        
        1. Client: STOR <filename>
        2. Server: 150 Opening data connection
        3. Data: 文件数据传输
        4. Server: 226 Transfer complete
        """
        packets = []
        
        # STOR 命令
        stor_cmd = self.create_command_packet(FTPCommand.STOR, filename)
        packets.append(stor_cmd)
        
        # 150 响应
        resp1 = self.create_response_packet(FTPResponse.READY, "Opening data connection")
        packets.append(resp1)
        
        # 数据传输
        data_packet = Packet(
            protocol=ProtocolType.FTP,
            data={
                "type": "data",
                "filename": filename,
                "size": len(data),
                "progress": 100,
                "content": data.decode() if data else "",
            },
            source="client",
            destination="server",
        )
        packets.append(data_packet)
        
        # 226 响应
        resp2 = self.create_response_packet(FTPResponse.TRANSFER_COMPLETE, "Transfer complete")
        packets.append(resp2)
        
        return packets
    
    def download_file(self, filename: str) -> List[Packet]:
        """
        下载文件
        
        1. Client: RETR <filename>
        2. Server: 150 Opening data connection
        3. Data: 文件数据传输
        4. Server: 226 Transfer complete
        """
        packets = []
        
        # RETR 命令
        retr_cmd = self.create_command_packet(FTPCommand.RETR, filename)
        packets.append(retr_cmd)
        
        # 150 响应
        resp1 = self.create_response_packet(FTPResponse.READY, "Opening data connection")
        packets.append(resp1)
        
        # 数据传输（模拟）
        data_packet = Packet(
            protocol=ProtocolType.FTP,
            data={
                "type": "data",
                "filename": filename,
                "size": 1024,
                "progress": 100,
            },
            source="server",
            destination="client",
        )
        packets.append(data_packet)
        
        # 226 响应
        resp2 = self.create_response_packet(FTPResponse.TRANSFER_COMPLETE, "Transfer complete")
        packets.append(resp2)
        
        return packets
    
    def list_directory(self) -> List[Packet]:
        """
        列出目录
        
        1. Client: LIST
        2. Server: 150 Opening data connection
        3. Data: 目录列表
        4. Server: 226 Transfer complete
        """
        packets = []
        
        # LIST 命令
        list_cmd = self.create_command_packet(FTPCommand.LIST, "")
        packets.append(list_cmd)
        
        # 150 响应
        resp1 = self.create_response_packet(FTPResponse.READY, "Opening data connection")
        packets.append(resp1)
        
        # 目录列表数据
        data_packet = Packet(
            protocol=ProtocolType.FTP,
            data={
                "type": "data",
                "listing": [
                    {"name": "file1.txt", "size": 1024, "type": "file"},
                    {"name": "file2.txt", "size": 2048, "type": "file"},
                    {"name": "docs", "size": 0, "type": "dir"},
                ],
            },
            source="server",
            destination="client",
        )
        packets.append(data_packet)
        
        # 226 响应
        resp2 = self.create_response_packet(FTPResponse.TRANSFER_COMPLETE, "Transfer complete")
        packets.append(resp2)
        
        return packets
    
    def process_packet(self, packet: Packet) -> Dict[str, Any]:
        """处理 FTP 数据包"""
        if packet.data.get("type") == "command":
            command = packet.data.get("command", "")
            argument = packet.data.get("argument", "")
            
            if command == FTPCommand.USER:
                return {"response": 331, "message": "Password required"}
            elif command == FTPCommand.PASS:
                self.logged_in = True
                self.current_user = argument
                return {"response": 230, "message": "Login successful"}
            elif command == FTPCommand.PWD:
                return {"response": 257, "message": '"/" is current directory'}
            elif command == FTPCommand.LIST:
                return {"response": 150, "message": "Opening data connection"}
            elif command == FTPCommand.RETR:
                return {"response": 150, "message": "Opening data connection"}
            elif command == FTPCommand.STOR:
                return {"response": 150, "message": "Opening data connection"}
            elif command == FTPCommand.QUIT:
                return {"response": 221, "message": "Goodbye"}
        
        return {"response": 200, "message": "Command OK"}
    
    def get_osi_layers(self, packet: Packet) -> List[Dict[str, Any]]:
        """获取 OSI 层级数据（应用层）"""
        return [
            {
                "layer": 7,
                "name": "Application Layer",
                "protocol": "FTP",
                "fields": packet.data,
                "raw": packet.data.get("raw", ""),
                "connection_type": "control" if packet.data.get("type") == "command" else "data",
            }
        ]
