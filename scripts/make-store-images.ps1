Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$store = Join-Path $root "store"
New-Item -ItemType Directory -Path $store -Force | Out-Null

$green = [System.Drawing.Color]::FromArgb(255, 31, 74, 58)
$paper = [System.Drawing.Color]::FromArgb(255, 244, 236, 217)
$card = [System.Drawing.Color]::FromArgb(255, 255, 250, 240)
$hit = [System.Drawing.Color]::FromArgb(255, 231, 243, 201)
$ink = [System.Drawing.Color]::FromArgb(255, 23, 53, 43)
$muted = [System.Drawing.Color]::FromArgb(255, 70, 101, 87)
$cream = [System.Drawing.Color]::FromArgb(255, 244, 230, 195)

function New-Font([string]$Name, [single]$Size, [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Regular) {
  return New-Object System.Drawing.Font($Name, $Size, $Style)
}

function New-Canvas([int]$W, [int]$H, [System.Drawing.Color]$Bg) {
  $bmp = New-Object System.Drawing.Bitmap $W, $H
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $g.Clear($Bg)
  return @{ Bmp = $bmp; G = $g }
}

function Save-Png($obj, [string]$Path) {
  $obj.Bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $obj.G.Dispose()
  $obj.Bmp.Dispose()
  Write-Output $Path
}

function Draw-RoundRect($g, $brush, $pen, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, $r, $r, 180, 90)
  $path.AddArc($x + $w - $r, $y, $r, $r, 270, 90)
  $path.AddArc($x + $w - $r, $y + $h - $r, $r, $r, 0, 90)
  $path.AddArc($x, $y + $h - $r, $r, $r, 90, 90)
  $path.CloseFigure()
  if ($brush) { $g.FillPath($brush, $path) }
  if ($pen) { $g.DrawPath($pen, $path) }
  $path.Dispose()
}

# Small promo 440x280
$p = New-Canvas 440 280 $green
$gb = New-Object System.Drawing.SolidBrush $cream
$ib = New-Object System.Drawing.SolidBrush $green
$p.G.FillEllipse($gb, 170, 48, 100, 100)
$pen = New-Object System.Drawing.Pen $green, 10
$pen.StartCap = "Round"; $pen.EndCap = "Round"; $pen.LineJoin = "Round"
$p.G.DrawLines($pen, @(
  (New-Object System.Drawing.PointF 196, 98),
  (New-Object System.Drawing.PointF 214, 118),
  (New-Object System.Drawing.PointF 246, 78)
))
$word = New-Font "Segoe UI" 28 Bold
$center = New-Object System.Drawing.StringFormat
$center.Alignment = "Center"
$p.G.DrawString("WeHaveIt", $word, $gb, (New-Object System.Drawing.RectangleF 0, 168, 440, 50), $center)
$sub = New-Font "Segoe UI" 12 Regular
$p.G.DrawString("Already in your home", $sub, $gb, (New-Object System.Drawing.RectangleF 0, 214, 440, 30), $center)
Save-Png $p (Join-Path $store "promo-small.png")

function Draw-ProductShot($path, $title, $price, $status, $detail, $btn, $photo1, $photo2, $hitBar) {
  $s = New-Canvas 1280 800 $paper
  $cardB = New-Object System.Drawing.SolidBrush $card
  $inkB = New-Object System.Drawing.SolidBrush $ink
  $mutB = New-Object System.Drawing.SolidBrush $muted
  $grB = New-Object System.Drawing.SolidBrush $green
  $hitB = New-Object System.Drawing.SolidBrush $(if ($hitBar) { $hit } else { $cream })
  $line = New-Object System.Drawing.Pen $green, 2
  Draw-RoundRect $s.G $cardB $line 48 40 1184 720 36

  $photoBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
    (New-Object System.Drawing.Rectangle 90, 180, 520, 460),
    $photo1, $photo2, 45
  )
  Draw-RoundRect $s.G $photoBrush $null 90 180 520 460 32

  $titleFont = New-Font "Segoe UI" 36 Bold
  $priceFont = New-Font "Segoe UI" 22 Bold
  $bodyFont = New-Font "Segoe UI" 14 Regular
  $s.G.DrawString($title, $titleFont, $inkB, (New-Object System.Drawing.RectangleF 650, 220, 540, 140))
  $s.G.DrawString($price, $priceFont, $inkB, 650, 380)
  $s.G.DrawString("Demo shop", $bodyFont, $mutB, 650, 190)

  Draw-RoundRect $s.G $grB $null 650 470 220 56 40
  $btnFont = New-Font "Segoe UI" 13 Bold
  $creamB = New-Object System.Drawing.SolidBrush $cream
  $s.G.DrawString("Buy now (fake)", $btnFont, $creamB, (New-Object System.Drawing.RectangleF 650, 484, 220, 40), $center)

  Draw-RoundRect $s.G $hitB $line 340 70 600 88 28
  $stFont = New-Font "Segoe UI" 16 Bold
  $s.G.DrawString($status, $stFont, $inkB, 430, 84)
  $s.G.DrawString($detail, $bodyFont, $mutB, 430, 114)
  Draw-RoundRect $s.G $grB $null 780 92 140 44 30
  $s.G.DrawString($btn, $btnFont, $creamB, (New-Object System.Drawing.RectangleF 780, 100, 140, 36), $center)

  $logoFont = New-Font "Segoe UI" 16 Bold
  $s.G.DrawString("WeHaveIt", $logoFont, $inkB, 80, 88)
  Save-Png $s $path
}

Draw-ProductShot (Join-Path $store "screenshot-1.png") "Anker USB-C`nCable 2m" "SGD 12.90" "Already in your home" "Shopee - 11 Sep 2026 - SGD 12.90" "Have it" $green ([System.Drawing.Color]::FromArgb(255,136,160,122)) $true
Draw-ProductShot (Join-Path $store "screenshot-2.png") "5L Digital`nAir Fryer" "SGD 89.00" "Not on your list yet" "Save it after you buy." "We have this" ([System.Drawing.Color]::FromArgb(255,91,58,29)) ([System.Drawing.Color]::FromArgb(255,232,194,122)) $false

$l = New-Canvas 1280 800 $paper
$inkB = New-Object System.Drawing.SolidBrush $ink
$mutB = New-Object System.Drawing.SolidBrush $muted
$grB = New-Object System.Drawing.SolidBrush $green
$creamB = New-Object System.Drawing.SolidBrush $cream
$h1 = New-Font "Segoe UI" 56 Bold
$le = New-Font "Segoe UI" 18 Regular
$l.G.DrawString("Stop buying what" + [char]10 + "you already own.", $h1, $inkB, (New-Object System.Drawing.RectangleF 80, 180, 700, 220))
$l.G.DrawString("A Chrome extension that warns you on Shopee, Amazon, FairPrice and other shops before you pay twice.", $le, $mutB, (New-Object System.Drawing.RectangleF 80, 430, 620, 90))
Draw-RoundRect $l.G $grB $null 80 540 240 64 40
$bf = New-Font "Segoe UI" 14 Bold
$center = New-Object System.Drawing.StringFormat
$center.Alignment = "Center"
$l.G.DrawString("WeHaveIt", $bf, $creamB, (New-Object System.Drawing.RectangleF 80, 556, 240, 40), $center)
Save-Png $l (Join-Path $store "screenshot-3.png")

Write-Output "Store images ready"
