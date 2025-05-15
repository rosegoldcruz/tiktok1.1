# restructure.ps1 — Unify & Deploy TikTok1.1

param(
  [switch]$SkipVenv = $false
)

function Abort($msg) {
  Write-Error $msg
  exit 1
}

# 1. Unpack
Write-Host "[1/10] Expanding archive..."
if (Test-Path "TikTok1.1.zip") {
  Expand-Archive -Path "TikTok1.1.zip" -DestinationPath "TikTok1.1_deploy" -Force
} else { Abort "Archive TikTok1.1.zip not found." }
Set-Location -Path "TikTok1.1_deploy"

# 2. Directory structure
Write-Host "[2/10] Creating directories..."
foreach ($d in @('src','config','assets','logs','build','docs')) {
  if (-not (Test-Path $d)) {
    New-Item -Path $d -ItemType Directory | Out-Null
  }
}

# 3. Source files
Write-Host "[3/10] Organizing source files..."
Move-Item -Path *.ps1       -Destination src -Force -ErrorAction SilentlyContinue
Move-Item -Path *.js,*.ts   -Destination src -Force -ErrorAction SilentlyContinue
Move-Item -Path *.py        -Destination src -Force -ErrorAction SilentlyContinue

# 4. Configs
Write-Host "[4/10] Moving config templates..."
if (Test-Path ".env.example") {
  Move-Item .env.example config/ -Force
}

# 5. Assets & logs
Write-Host "[5/10] Consolidating media and logs..."
if (Test-Path "media")    { Move-Item media\*    assets/ -Force }
if (Test-Path "raw_logs") { Move-Item raw_logs\* logs/ -Force }

# 6. Dependencies
Write-Host "[6/10] Bootstrapping Node.js + Python..."
Set-Location src
npm init -y | Out-Null
npm install dotenv | Out-Null

if (-not $SkipVenv) {
  python -m venv .venv
  & .\.venv\Scripts\pip install --upgrade pip | Out-Null
  if (Test-Path "..\requirements.txt") {
    & .\.venv\Scripts\pip install -r ..\requirements.txt | Out-Null
  } else {
    Write-Warning "requirements.txt not found."
  }
}

Set-Location ..

# 7. Git + CI
Write-Host "[7/10] Initializing Git & CI..."
if (-not (Test-Path ".git")) {
  git init
  git add .
  git commit -m "Initial unified structure"
}

if (-not (Test-Path ".github\workflows")) {
  New-Item -Path .github\workflows -ItemType Directory | Out-Null
}

@"
name: Deploy TikTok1.1
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          npm install
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Run lint & tests
        run: |
          npm run lint || echo 'no lint script'
          npm test
      - name: Package artifact
        run: zip -r build/TikTok1.1_artifact.zip .
      - name: Deploy (placeholder)
        run: echo 'Deploy to your target environment'
"@ | Out-File .github\workflows\deploy.yml -Encoding utf8

# 8. Dockerfile stub
Write-Host "[8/10] Creating Dockerfile stub..."
@"
FROM mcr.microsoft.com/windows/nanoserver:1809
WORKDIR /app
COPY src .\src
COPY package.json .
RUN npm install
CMD [\"node\",\"src/index.js\"]
"@ | Out-File Dockerfile -Encoding utf8

# 9. Tests & smoke run
Write-Host "[9/10] Running tests..."
if (Test-Path "tests") {
  & .\.venv\Scripts\pytest tests
} else {
  Write-Warning "No tests directory found."
}
npm run start 2>$null

# 10. Open README
Write-Host "[10/10] Opening README..."
if (Test-Path "README.md") {
  notepad++ README.md
} else {
  notepad++ README.txt
}

Write-Host "Reorganization complete."
