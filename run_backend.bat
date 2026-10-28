@echo off
echo ==============================================
echo   Starting SEO Audit AI Backend (Port 8000)
echo ==============================================
"%~dp0backend\venv\Scripts\python.exe" -m uvicorn app.main:app --app-dir "%~dp0backend" --reload --host 127.0.0.1 --port 8000
pause
