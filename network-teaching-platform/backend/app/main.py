"""
NetLab - 深度网络协议交互平台
FastAPI 应用入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import Base, engine
from app.api import auth, experiment, topology, tcp, udp, http, rip, ftp
from app.websocket import handler

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="深度网络协议交互平台 - 基于 macOS Sonoma 设计语言",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(experiment.router)
app.include_router(topology.router)
app.include_router(tcp.router, prefix="/api/experiment/tcp", tags=["TCP 实验"])
app.include_router(udp.router, prefix="/api/experiment/udp", tags=["UDP 实验"])
app.include_router(http.router, prefix="/api/experiment/http", tags=["HTTP 实验"])
app.include_router(rip.router, prefix="/api/experiment/rip", tags=["RIP 实验"])
app.include_router(ftp.router, prefix="/api/experiment/ftp", tags=["FTP 实验"])
app.include_router(handler.router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "深度网络协议交互平台",
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "database": "connected" if settings.database_url else "disconnected",
    }


@app.get("/api")
async def api_info():
    """API 信息"""
    return {
        "name": "NetLab API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
