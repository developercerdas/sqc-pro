@echo off
title Executive Production & Defect Quality Dashboard
cd /d "%~dp0"
echo =======================================================
echo Memulai Aplikasi Dashboard Produksi & Defect Quality...
echo =======================================================
start http://localhost:3000
node server.js
pause
