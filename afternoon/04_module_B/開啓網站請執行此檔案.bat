:: 釋放 Port 8000
powershell -Command "Get-NetTCPConnection -LocalPort 8000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"

@echo off
cd /d "%~dp0\..\public"
echo Starting server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
npx http-server -p 8000 -o
