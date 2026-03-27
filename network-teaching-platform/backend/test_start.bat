@echo off
chcp 65001 >nul
echo ========================================
echo   测试后端服务
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 激活虚拟环境...
call venv\Scripts\activate.bat

echo [2/3] 测试导入...
python -c "from app.main import app; print('导入成功')" 2>&1
if errorlevel 1 (
    echo [错误] 导入失败
    pause
    exit /b 1
)

echo.
echo [3/3] 启动服务...
echo 服务地址：http://localhost:8000
echo API 文档：http://localhost:8000/docs
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
