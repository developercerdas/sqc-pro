@echo off
title Push Project ke GitHub
cd /d "%~dp0"
echo =======================================================
echo          PUSH APLIKASI KE REPOSITORY GITHUB
echo =======================================================
echo.

:: Cek apakah git sudah terpasang
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git belum terinstall di komputer ini.
    echo Silakan install Git terlebih dahulu dari https://git-scm.com/
    pause
    exit /b
)

:: Inisialisasi repo jika belum
if not exist ".git" (
    echo Menginisialisasi Git repository lokal...
    git init
    git branch -M main
)

echo Menambahkan file ke staging (kecuali node_modules)...
git add .

echo Membuat commit...
git commit -m "feat: Initial commit Executive Quality Defect Dashboard Node.js"

echo.
echo =======================================================
echo Sekarang masukkan URL remote GitHub Anda.
echo Contoh: https://github.com/username-anda/nama-repo.git
echo =======================================================
set /p REPO_URL="Masukkan URL GitHub Repo: "

if "%REPO_URL%"=="" (
    echo [BATAL] URL tidak dimasukkan.
    pause
    exit /b
)

git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo.
echo Mengunggah file ke GitHub (git push -u origin main)...
git push -u origin main

echo.
echo =======================================================
echo Selesai! Proyek Anda sudah terunggah di GitHub.
echo =======================================================
pause
