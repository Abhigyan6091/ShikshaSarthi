# Phase 2 Windows Installer

The installer source is in `installer/windows` and uses Inno Setup.

## What It Does

- Copies deployment files to `C:\Program Files\ShikshaSarthi`
- Stores school data under `C:\ProgramData\ShikshaSarthi`
- Creates Start Menu and Desktop shortcuts
- Opens firewall port `6050`
- Starts the Docker Compose app if selected
- Shows/opens `http://localhost:6050`

## Prerequisites

Docker Desktop is required on the school master server. The installer checks for Docker and prints a clear message if it is missing.

```powershell
powershell -ExecutionPolicy Bypass -File installer\windows\install-prerequisites.ps1
```

## Build EXE

Install Inno Setup 6 on Windows, then:

```powershell
cd installer\windows
powershell -ExecutionPolicy Bypass -File build-installer.ps1
```

If Inno Setup is not installed, the script prints exact build steps. The Linux environment cannot compile the final EXE.

## Operation

Installed scripts:

```text
start-shiksha-sarthi.bat
stop-shiksha-sarthi.bat
restart-shiksha-sarthi.bat
open-shiksha-sarthi.bat
health-check.bat
```

Phase 3 will add automatic install/rollback. Phase 2 only downloads and verifies update packages.
