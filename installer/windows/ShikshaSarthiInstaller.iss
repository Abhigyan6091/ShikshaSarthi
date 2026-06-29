#define MyAppName "ShikshaSarthi"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "S3 Lab IIT Bhilai"

[Setup]
AppId={{D78C0A64-31F7-4B64-9C8C-5348494B5348}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\ShikshaSarthi
DefaultGroupName=ShikshaSarthi
OutputDir=Output
OutputBaseFilename=ShikshaSarthiInstaller
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
WizardStyle=modern

[Files]
Source: "docker-compose.yml"; DestDir: "{app}"; DestName: "docker-compose.yml"; Flags: ignoreversion
Source: "..\..\.env.local-school.example"; DestDir: "{app}"; DestName: ".env.local-school.example"; Flags: ignoreversion
Source: "..\..\Dockerfile"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\nginx.conf"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\docker-entrypoint.sh"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\backend\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "node_modules,.env,backups,uploads,data\audio-cache"
Source: "..\..\src\*"; DestDir: "{app}\src"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\package-lock.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\vite.config.ts"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\tailwind.config.ts"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\tsconfig.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\postcss.config.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\installer\windows\*.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\installer\windows\*.ps1"; DestDir: "{app}\installer\windows"; Flags: ignoreversion
Source: "..\..\scripts\*"; DestDir: "{app}\scripts"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\docs\*"; DestDir: "{app}\docs"; Flags: ignoreversion recursesubdirs createallsubdirs

[Dirs]
Name: "{commonappdata}\ShikshaSarthi\mongo-data"
Name: "{commonappdata}\ShikshaSarthi\uploads"
Name: "{commonappdata}\ShikshaSarthi\backups"
Name: "{commonappdata}\ShikshaSarthi\logs"
Name: "{commonappdata}\ShikshaSarthi\updates"
Name: "{commonappdata}\ShikshaSarthi\config"

[Icons]
Name: "{group}\Open ShikshaSarthi"; Filename: "{app}\open-shiksha-sarthi.bat"; WorkingDir: "{app}"
Name: "{group}\Start ShikshaSarthi"; Filename: "{app}\start-shiksha-sarthi.bat"; WorkingDir: "{app}"
Name: "{group}\Stop ShikshaSarthi"; Filename: "{app}\stop-shiksha-sarthi.bat"; WorkingDir: "{app}"
Name: "{commondesktop}\ShikshaSarthi"; Filename: "{app}\open-shiksha-sarthi.bat"; WorkingDir: "{app}"

[Run]
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\windows\install-prerequisites.ps1"""; Flags: runhidden waituntilterminated
Filename: "netsh.exe"; Parameters: "advfirewall firewall add rule name=""ShikshaSarthi 6050"" dir=in action=allow protocol=TCP localport=6050"; Flags: runhidden waituntilterminated
Filename: "{cmd}"; Parameters: "/c if not exist ""{app}\.env"" copy ""{app}\.env.local-school.example"" ""{app}\.env"""; Flags: runhidden waituntilterminated
Filename: "{app}\start-shiksha-sarthi.bat"; Description: "Start ShikshaSarthi now"; Flags: postinstall skipifsilent nowait

[Code]
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  if not Exec('cmd.exe', '/c docker --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('Docker Desktop is required. Run install-prerequisites.ps1 after installing Docker Desktop, then launch ShikshaSarthi again.', mbInformation, MB_OK);
  end;
  Result := True;
end;
