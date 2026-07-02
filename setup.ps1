Write-Host "Setting up PromptGuard..." -ForegroundColor Cyan

# 1. Setup Backend virtual environment and install requirements
Write-Host "`nSetting up Python backend environment..." -ForegroundColor Yellow
if (-not (Test-Path "backend\venv")) {
    python -m venv backend\venv
}
& backend\venv\Scripts\pip install -r backend\requirements.txt

# 2. Setup Frontend dependencies
Write-Host "`nInstalling frontend npm dependencies..." -ForegroundColor Yellow
cd frontend
npm install
cd ..

# 3. Create .env if not exists
if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
    Write-Host "`nCreated .env from .env.example. Please update your environment variables!" -ForegroundColor Green
}

Write-Host "`nPromptGuard setup complete!" -ForegroundColor Green
