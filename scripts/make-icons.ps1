Add-Type -AssemblyName System.Drawing

function New-Icon([int]$Size, [string]$Path) {
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::FromArgb(255, 31, 74, 58))

  $paper = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 244, 230, 195))
  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 31, 74, 58))

  $pad = [Math]::Max(2, [int]($Size * 0.18))
  $rect = New-Object System.Drawing.Rectangle $pad, $pad, ($Size - 2 * $pad), ($Size - 2 * $pad)
  $g.FillEllipse($paper, $rect)

  $penWidth = [Math]::Max(2, [int]($Size * 0.1))
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 31, 74, 58)), $penWidth
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  $x1 = $Size * 0.28
  $y1 = $Size * 0.52
  $x2 = $Size * 0.44
  $y2 = $Size * 0.68
  $x3 = $Size * 0.74
  $y3 = $Size * 0.34
  $g.DrawLines($pen, @(
    (New-Object System.Drawing.PointF $x1, $y1),
    (New-Object System.Drawing.PointF $x2, $y2),
    (New-Object System.Drawing.PointF $x3, $y3)
  ))

  $dir = Split-Path $Path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $paper.Dispose()
  $ink.Dispose()
  $pen.Dispose()
}

$root = Split-Path -Parent $PSScriptRoot
if (-not $PSScriptRoot) { $root = Get-Location }
$iconDir = Join-Path $PSScriptRoot "..\extension\icons"
$iconDir = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\extension\icons"))
New-Icon 16 (Join-Path $iconDir "icon16.png")
New-Icon 48 (Join-Path $iconDir "icon48.png")
New-Icon 128 (Join-Path $iconDir "icon128.png")
Write-Output "Wrote icons to $iconDir"
