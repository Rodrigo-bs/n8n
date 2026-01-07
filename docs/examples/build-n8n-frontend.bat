@echo off
REM ############################################################################
REM Build n8n Frontend for Next.js Integration (Windows)
REM 
REM This script builds the n8n frontend and copies it to your Next.js project.
REM 
REM Usage:
REM   build-n8n-frontend.bat [backend-api-url] [nextjs-public-dir]
REM 
REM Examples:
REM   build-n8n-frontend.bat http://localhost:5678/ .\public\n8n-editor
REM   build-n8n-frontend.bat https://api.example.com/ C:\path\to\nextjs\public\n8n-editor
REM ############################################################################

SETLOCAL EnableDelayedExpansion

REM Default values
SET "BACKEND_API_URL=%~1"
IF "%BACKEND_API_URL%"=="" SET "BACKEND_API_URL=http://localhost:5678/"

SET "NEXTJS_PUBLIC_DIR=%~2"
IF "%NEXTJS_PUBLIC_DIR%"=="" SET "NEXTJS_PUBLIC_DIR=.\public\n8n-editor"

IF "%N8N_REPO_DIR%"=="" SET "N8N_REPO_DIR=.\n8n"

echo ==========================================
echo Building n8n Frontend
echo ==========================================
echo Backend API URL: %BACKEND_API_URL%
echo Next.js Public Dir: %NEXTJS_PUBLIC_DIR%
echo n8n Repo Dir: %N8N_REPO_DIR%
echo.

REM Check if n8n repository exists
IF NOT EXIST "%N8N_REPO_DIR%" (
  echo Error: n8n repository not found at %N8N_REPO_DIR%
  echo Please clone n8n first or set N8N_REPO_DIR environment variable
  exit /b 1
)

REM Navigate to n8n repository
cd /d "%N8N_REPO_DIR%"

REM Check if dependencies are installed
IF NOT EXIST "node_modules" (
  echo Installing n8n dependencies...
  pnpm install
)

REM Build the frontend with the specified backend API URL
echo.
echo Building frontend...
cd packages\frontend\editor-ui

REM Set the backend API URL and build
set VUE_APP_URL_BASE_API=%BACKEND_API_URL%
pnpm build

REM Navigate back
cd ..\..\..

REM Create target directory if it doesn't exist
IF NOT EXIST "%NEXTJS_PUBLIC_DIR%" mkdir "%NEXTJS_PUBLIC_DIR%"

REM Copy the built files
echo.
echo Copying built files to Next.js public directory...
xcopy /E /I /Y packages\frontend\editor-ui\dist\* "%NEXTJS_PUBLIC_DIR%\"

echo.
echo ==========================================
echo Build Complete!
echo ==========================================
echo The n8n frontend has been built and copied to:
echo   %NEXTJS_PUBLIC_DIR%
echo.
echo You can now access it in your Next.js app at:
echo   /n8n-editor/index.html
echo.
echo Next steps:
echo   1. Ensure your backend is running at %BACKEND_API_URL%
echo   2. Create a Next.js page to embed the editor (see examples)
echo   3. Test the integration
echo ==========================================

ENDLOCAL
