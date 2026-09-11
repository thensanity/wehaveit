$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$ext = Join-Path $root "extension"
$outDir = Join-Path $root "store"
$zip = Join-Path $outDir "wehaveit.zip"
$stage = Join-Path $env:TEMP "wehaveit-cws"

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null
Copy-Item -Path (Join-Path $ext "*") -Destination $stage -Recurse
Get-ChildItem -Path $stage -Recurse -Include "*.test.js" | Remove-Item -Force
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -CompressionLevel Optimal
Remove-Item $stage -Recurse -Force
Write-Output "Wrote $zip"
