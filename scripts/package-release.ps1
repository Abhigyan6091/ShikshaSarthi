$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$packageJson = Get-Content (Join-Path $root "backend\package.json") | ConvertFrom-Json
$version = if ($args.Count -gt 0) { $args[0] } else { $packageJson.version }
$channel = if ($env:RELEASE_CHANNEL) { $env:RELEASE_CHANNEL } else { "stable" }
$outDir = Join-Path $root "dist-release"
$stagingRoot = Join-Path $outDir "staging"
$staging = Join-Path $stagingRoot "shiksha-sarthi-$version"
$package = "shiksha-sarthi-$version.zip"

Remove-Item $stagingRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $staging | Out-Null
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$exclude = @(
  ".git", ".env", "node_modules", "backend\node_modules", "backend\.env",
  "backend\backups", "backend\uploads", "backend\data\audio-cache",
  "uploads", "mongodb\data", "shikshasarthi-launcher\data", "k8s",
  "dist-release", "dist", "QuestionGenerator\VQG", "question_bank\textbooks"
)

Get-ChildItem $root -Force | Where-Object {
  $relative = $_.FullName.Substring($root.Path.Length).TrimStart("\")
  -not ($exclude | Where-Object { $relative -eq $_ -or $relative.StartsWith("$_\") })
} | ForEach-Object {
  Copy-Item $_.FullName -Destination $staging -Recurse -Force
}

$zipPath = Join-Path $outDir $package
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Compress-Archive -Path (Join-Path $stagingRoot "shiksha-sarthi-$version") -DestinationPath $zipPath

$sha256 = (Get-FileHash $zipPath -Algorithm SHA256).Hash.ToLower()
"$sha256  $package" | Set-Content (Join-Path $outDir "shiksha-sarthi-$version.sha256")

$manifest = [ordered]@{
  app = "ShikshaSarthi"
  version = $version
  releaseDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  packageFile = $package
  sha256 = $sha256
  channel = $channel
  notes = @()
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $outDir "manifest.json")

Remove-Item $stagingRoot -Recurse -Force
Write-Host "Release package created in $outDir"
