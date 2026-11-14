@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem 使用 Node 22（默认 PATH 里的 Node 16 太旧，Vite 5 需要 18+）
set PATH=D:\sort\itsort\nodejs\node-v22;%PATH%
rem 清除会让 Electron 以 Node 模式运行的干扰变量
set ELECTRON_RUN_AS_NODE=
echo 启动 Videdown 开发模式...
pnpm dev
pause
