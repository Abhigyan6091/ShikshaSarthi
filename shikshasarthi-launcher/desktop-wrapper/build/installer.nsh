; Custom NSIS steps for ShikshaSarthi (electron-builder include hook).
; Runs the bundled Visual C++ runtime (required by the bundled MongoDB 7.0
; mongod.exe) and provisions the shared ProgramData data directory so the
; non-elevated app process can create/write the local database there.

!macro customInstall
  ; ----- Visual C++ 2015-2022 x64 redistributable (MongoDB runtime dep) -----
  ; Shipped via extraResources at resources\launcher-data\vc_redist.x64.exe
  IfFileExists "$INSTDIR\resources\launcher-data\vc_redist.x64.exe" 0 +3
    DetailPrint "Installing Visual C++ runtime (required by the database engine)..."
    ExecWait '"$INSTDIR\resources\launcher-data\vc_redist.x64.exe" /install /quiet /norestart'

  ; ----- Shared data directory under ProgramData -----
  CreateDirectory "$COMMONAPPDATA\ShikshaSarthi"
  CreateDirectory "$COMMONAPPDATA\ShikshaSarthi\data"
  ; Grant the local Users group modify rights so standard accounts can run
  ; the bundled MongoDB and write school data.
  nsExec::ExecToLog 'icacls "$COMMONAPPDATA\ShikshaSarthi" /grant *S-1-5-32-545:(OI)(CI)M /T /C'
!macroend

!macro customUnInstall
  ; Intentionally preserve $COMMONAPPDATA\ShikshaSarthi (school data, DB,
  ; backups, synced media) so uninstalling/upgrading never destroys data.
!macroend
