@echo off
:: ============================================================
:: start.bat — Planet Analog Search Engine
:: NASA Space Apps Challenge 2026
:: ============================================================
:: Uso:
::   Doble click en start.bat   -> levanta backend + frontend
::   start.bat stop             -> mata los procesos en puertos 8000 y 5173
:: ============================================================

title Planet Analog Search Engine — NASA Space Apps 2026

:: ─── Banner ──────────────────────────────────────────────────
echo.
echo   ** PLANET ANALOG SEARCH ENGINE **
echo      NASA Space Apps Challenge 2026
echo.

:: ─── Modo stop ───────────────────────────────────────────────
if "%1"=="stop" goto :stop_all

:: ─── Verificar Python ────────────────────────────────────────
echo Verificando entorno...

python --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Python no encontrado.
        echo   Descarga Python 3.11+ desde https://python.org/downloads
        echo   Asegurate de marcar "Add Python to PATH" durante la instalacion.
        pause
        exit /b 1
    )
    set PYTHON=py
) else (
    set PYTHON=python
)

for /f "tokens=*" %%v in ('%PYTHON% --version') do echo   OK: %%v

:: ─── Verificar Node ──────────────────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado.
    echo   Descarga Node 18+ desde https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo   OK: Node %%v

:: ─── Verificar dependencias backend ──────────────────────────
%PYTHON% -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo   Instalando dependencias backend...
    cd backend
    %PYTHON% -m pip install -r requirements.txt -q
    cd ..
    echo   OK: Dependencias backend instaladas
) else (
    echo   OK: Dependencias backend ya instaladas
)

:: ─── Verificar dependencias frontend ─────────────────────────
if not exist "frontend\node_modules" (
    echo   Instalando dependencias frontend ^(npm install^)...
    cd frontend
    npm install --silent
    cd ..
    echo   OK: Dependencias frontend instaladas
) else (
    echo   OK: Dependencias frontend ya instaladas
)

:: ─── Liberar puertos si estan ocupados ───────────────────────
echo.
echo Liberando puertos 8000 y 5173 si estan ocupados...
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":8000 "') do (
    taskkill /PID %%p /F >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":5173 "') do (
    taskkill /PID %%p /F >nul 2>&1
)

:: ─── Iniciar Backend en nueva ventana ────────────────────────
echo.
echo Iniciando Backend en http://localhost:8000 ...
start "Backend - FastAPI :8000" cmd /k "cd /d %~dp0backend && %PYTHON% -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

:: ─── Esperar a que el backend levante ────────────────────────
echo   Esperando que el backend levante...
set /a intentos=0
:wait_loop
timeout /t 2 /nobreak >nul
curl -s http://localhost:8000/api/v1/health >nul 2>&1
if errorlevel 1 (
    set /a intentos+=1
    if %intentos% lss 10 goto :wait_loop
    echo   Backend tardando mas de lo esperado. Continua de todas formas...
) else (
    echo   OK: Backend saludable
)

:: ─── Iniciar Frontend en nueva ventana ───────────────────────
echo.
echo Iniciando Frontend en http://localhost:5173 ...
start "Frontend - Vite :5173" cmd /k "cd /d %~dp0frontend && npm run dev"

:: ─── Esperar que el frontend arranque ────────────────────────
timeout /t 4 /nobreak >nul

:: ─── Abrir el navegador automaticamente ──────────────────────
echo   Abriendo navegador...
start "" http://localhost:5173

:: ─── Mensaje final ───────────────────────────────────────────
echo.
echo ================================================
echo   APLICACION LISTA
echo ================================================
echo.
echo   Dashboard : http://localhost:5173
echo   API Docs  : http://localhost:8000/docs
echo   Health    : http://localhost:8000/api/v1/health
echo.
echo   Para detener: cierra las ventanas de Backend y Frontend
echo   o ejecuta:  start.bat stop
echo.
pause
exit /b 0

:: ─── Stop ────────────────────────────────────────────────────
:stop_all
echo Deteniendo procesos en puertos 8000 y 5173...
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":8000 "') do (
    taskkill /PID %%p /F >nul 2>&1
    echo   Detenido proceso en puerto 8000 (PID %%p)
)
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":5173 "') do (
    taskkill /PID %%p /F >nul 2>&1
    echo   Detenido proceso en puerto 5173 (PID %%p)
)
echo OK: Todo detenido.
pause
exit /b 0
