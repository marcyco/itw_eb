"""
NetLab 配置模块
"""
import os
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用配置
    APP_NAME: str = "NetLab"
    APP_VERSION: str = "1.0.0"
    NETLAB_DEBUG: bool = True
    
    # 数据库配置
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_DATABASE: str = "network_teaching"
    NETLAB_USE_SQLITE: bool = True
    
    # SQLite 配置
    NETLAB_DATABASE_URL: str = "sqlite:///./network_teaching.db"
    
    # 安全配置
    NETLAB_SECRET_KEY: str = "netlab-dev-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS 配置
    NETLAB_CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    
    @property
    def DEBUG(self) -> bool:
        return self.NETLAB_DEBUG
    
    @property
    def USE_SQLITE(self) -> bool:
        return self.NETLAB_USE_SQLITE
    
    @property
    def DATABASE_URL(self) -> str:
        return self.NETLAB_DATABASE_URL
    
    @property
    def database_url(self) -> str:
        """获取数据库连接 URL"""
        if self.USE_SQLITE:
            return self.DATABASE_URL
        
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
    
    @property
    def CORS_ORIGINS(self) -> str:
        return self.NETLAB_CORS_ORIGINS
    
    @property
    def cors_origins(self) -> List[str]:
        """获取 CORS 源列表"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        extra='ignore',
        env_prefix='NETLAB_'
    )


# 全局配置实例
settings = Settings()
