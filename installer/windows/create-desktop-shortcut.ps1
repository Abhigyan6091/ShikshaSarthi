$ErrorActionPreference = "Stop"

$installDir = "${env:ProgramFiles}\ShikshaSarthi"
$target = Join-Path $installDir "open-shiksha-sarthi.bat"
$shortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "ShikshaSarthi.lnk"

$shell = New-Object -ComObject WScript.Shell
$link = $shell.CreateShortcut($shortcut)
$link.TargetPath = $target
$link.WorkingDirectory = $installDir
$link.IconLocation = "$env:SystemRoot\System32\SHELL32.dll,220"
$link.Save()

Write-Host "Desktop shortcut created: $shortcut"
