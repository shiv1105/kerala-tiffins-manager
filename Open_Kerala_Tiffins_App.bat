@echo off
setlocal

cd /d "%~dp0"

set "PORT=5173"
set "APP_URL=http://127.0.0.1:%PORT%"
set "PNPM_CMD=pnpm"

if exist "C:\Users\shiva\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd" (
  set "PNPM_CMD=C:\Users\shiva\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
)

echo Kerala Tiffins Manager
echo Project: %CD%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing -Uri '%APP_URL%' -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul

if errorlevel 1 (
  echo Starting local web app on %APP_URL% ...

  if not exist "node_modules" (
    echo Installing dependencies. This may take a minute the first time.
    call "%PNPM_CMD%" install
    if errorlevel 1 (
      echo.
      echo Could not install dependencies. Please make sure Node.js and pnpm are available.
      pause
      exit /b 1
    )
  )

  start "Kerala Tiffins Dev Server" cmd /k "cd /d ""%~dp0"" && ""%PNPM_CMD%"" dev -- --host 127.0.0.1 --port %PORT%"
  timeout /t 5 /nobreak >nul
) else (
  echo Local web app is already running at %APP_URL%.
)

set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_EXE if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_EXE if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"

echo Opening Chrome...
if defined CHROME_EXE (
  start "" "%CHROME_EXE%" "%APP_URL%"
) else (
  echo Chrome was not found in the usual locations. Opening with the default browser instead.
  start "" "%APP_URL%"
)

echo.
echo You can close this window. Keep the dev server window open while using the app.
timeout /t 3 /nobreak >nul

endlocal
