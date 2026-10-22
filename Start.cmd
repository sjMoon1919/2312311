@echo off
cd /d "%~dp0"
set "BUDGET_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "BUDGET_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not "%BUDGET_NODE%"=="node" if not exist "%BUDGET_NODE%" (
  echo Node.js 18 or later is required. See README.md.
  pause
  exit /b 1
)
echo Open http://127.0.0.1:4173 in your browser.
echo Keep this window open. Press Ctrl+C to stop.
"%BUDGET_NODE%" server.mjs
pause
