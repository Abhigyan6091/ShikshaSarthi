# ShikshaSarthi Windows Installer

This folder prepares a Windows EXE installer using Inno Setup. The installer copies the local-school Docker deployment to `C:\Program Files\ShikshaSarthi` and keeps school data under `C:\ProgramData\ShikshaSarthi`.

## Build the EXE

Install Inno Setup 6 on a Windows build machine, then run:

```powershell
powershell -ExecutionPolicy Bypass -File installer\windows\build-installer.ps1
```

If `ISCC.exe` is not found, the script prints the exact install/build steps.

## School Server Prerequisites

Docker Desktop is required. Run:

```powershell
powershell -ExecutionPolicy Bypass -File installer\windows\install-prerequisites.ps1
```

The installer does not bundle AWS keys, `CONTROL_API_KEY`, or other secrets. Configure `.env` after installation if AWS sync is needed.

## Installed Layout

Application files:

```text
C:\Program Files\ShikshaSarthi
```

School data:

```text
C:\ProgramData\ShikshaSarthi\mongo-data
C:\ProgramData\ShikshaSarthi\uploads
C:\ProgramData\ShikshaSarthi\backups
C:\ProgramData\ShikshaSarthi\logs
C:\ProgramData\ShikshaSarthi\updates
C:\ProgramData\ShikshaSarthi\config
```

The installer opens firewall port `6050` and creates Start Menu/Desktop shortcuts. The local URL is:

```text
http://localhost:6050
```
