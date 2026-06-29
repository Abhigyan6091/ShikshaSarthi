$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$iss = Join-Path $scriptDir "ShikshaSarthiInstaller.iss"
$compilerCandidates = @(
  "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
  "${env:ProgramFiles}\Inno Setup 6\ISCC.exe"
)

$compiler = $compilerCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $compiler) {
  Write-Host "Inno Setup compiler was not found."
  Write-Host "Install Inno Setup 6 from https://jrsoftware.org/isinfo.php"
  Write-Host "Then run:"
  Write-Host "  powershell -ExecutionPolicy Bypass -File installer\windows\build-installer.ps1"
  exit 0
}

& $compiler $iss
Write-Host "Installer build completed. Check installer\windows\Output for ShikshaSarthiInstaller.exe"
