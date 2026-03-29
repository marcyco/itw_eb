@echo off
chcp 65001 >nul
echo ============================================
echo   NetLab 后端服务启动脚本
echo ============================================
echo.

:: 检查虚拟环境
if not exist "venv\Scripts\activate.bat" (
    echo [错误] 虚拟环境不存在，请先创建虚拟环境
    echo 运行：python -m venv venv
    pause
    exit /b 1
)

:: 激活虚拟环境
echo [1/3] 激活虚拟环境...
call venv\Scripts\activate.bat

:: 检查依赖
echo [2/3] 检查依赖...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo [警告] 依赖未安装，正在安装...
    pip install -r requirements.txt
)

:: 启动服务
echo [3/3] 启动 FastAPI 服务...
echo.
echo 访问 API 文档：http://localhost:8000/docs
echo 访问 ReDoc: http://localhost:8000/redoc
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
