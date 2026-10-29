# SIFAAIZ — tiny local web server (no installs needed).
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1
# Then open http://localhost:8000  (Ctrl+C to stop)
param([int]$Port = 8000)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$types = @{
  ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"
  ".svg" = "image/svg+xml"; ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"; ".webp" = "image/webp"; ".avif" = "image/avif"
  ".woff2" = "font/woff2"; ".mp3" = "audio/mpeg"; ".m4a" = "audio/mp4"; ".ogg" = "audio/ogg"; ".wav" = "audio/wav"
  ".mp4" = "video/mp4"; ".webm" = "video/webm"; ".mov" = "video/quicktime"; ".txt" = "text/plain; charset=utf-8"; ".md" = "text/plain; charset=utf-8"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/  (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request; $res = $ctx.Response
    try {
      $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart("/"))
      if ($rel -eq "") { $rel = "index.html" }
      $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
      if (-not $path.StartsWith($root) -or -not (Test-Path $path -PathType Leaf)) {
        $res.StatusCode = 404
      } else {
        $ext = [IO.Path]::GetExtension($path).ToLower()
        $res.ContentType = if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" }
        $res.Headers["Accept-Ranges"] = "bytes"
        $res.Headers["Cache-Control"] = "no-cache"
        $fs = [IO.File]::OpenRead($path)
        $len = $fs.Length; $start = 0; $end = $len - 1
        $range = $req.Headers["Range"]
        if ($range -match "bytes=(\d*)-(\d*)") {
          if ($matches[1]) { $start = [int64]$matches[1] }
          if ($matches[2]) { $end = [Math]::Min([int64]$matches[2], $len - 1) }
          $res.StatusCode = 206
          $res.Headers["Content-Range"] = "bytes $start-$end/$len"
        }
        $count = $end - $start + 1
        $res.ContentLength64 = $count
        if ($req.HttpMethod -ne "HEAD") {
          $fs.Seek($start, "Begin") | Out-Null
          $buf = New-Object byte[] 65536
          while ($count -gt 0) {
            $n = $fs.Read($buf, 0, [Math]::Min($buf.Length, $count))
            if ($n -le 0) { break }
            $res.OutputStream.Write($buf, 0, $n); $count -= $n
          }
        }
        $fs.Close()
      }
    } catch { } finally { try { $res.Close() } catch { } }
  }
} finally { $listener.Stop() }
