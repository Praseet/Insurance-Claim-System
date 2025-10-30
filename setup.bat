@echo off
REM Insurance Claim System - Quick Setup Script for Windows

echo ========================================
echo Smart Insurance Claim Automation System
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo [OK] Docker and Docker Compose are installed
echo.

REM Copy .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo [OK] .env file created
) else (
    echo [OK] .env file already exists
)
echo.

REM Build and start services
echo Building and starting Docker containers...
docker-compose up --build -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Seed the database
echo.
echo Seeding database with sample data...
docker-compose exec backend npm run seed

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:5000
echo.
echo Demo Accounts:
echo   User:    john@example.com / password123
echo   Insurer: insurer@example.com / password123
echo   Admin:   admin@example.com / password123
echo.
echo Useful Commands:
echo   View logs:    docker-compose logs -f
echo   Stop system:  docker-compose down
echo   Restart:      docker-compose restart
echo.
echo Open http://localhost:3000 in your browser to get started!
echo.
pause
