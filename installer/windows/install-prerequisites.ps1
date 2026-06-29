$ErrorActionPreference = "Stop"

Write-Host "Checking Windows prerequisites for ShikshaSarthi..."

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "Docker Desktop is required and was not found."
  Write-Host "Install Docker Desktop from https://www.docker.com/products/docker-desktop/"
  Write-Host "After installation, enable WSL 2 backend and restart this installer."
  exit 1
}

docker --version
Write-Host "Docker Desktop is available."
Write-Host "Inno Setup is only required on the build machine, not the school server."
