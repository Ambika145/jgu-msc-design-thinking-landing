# Simple local server for static files (no Node/Python required)
$port = 3000
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host ""
Write-Host "  Local server running" -ForegroundColor Green
Write-Host "  Open: http://localhost:$port" -ForegroundColor Cyan
Write-Host "  Folder: $root" -ForegroundColor Gray
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".htm"  = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".webp" = "image/webp"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2" = "font/woff2"
}

function Get-ContentType([string]$path) {
  $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
  if ($mime.ContainsKey($ext)) { return $mime[$ext] }
  return "application/octet-stream"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $rel = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }

    $file = Join-Path $root ($rel -replace "/", [IO.Path]::DirectorySeparatorChar)
    $file = [IO.Path]::GetFullPath($file)

    if (-not $file.StartsWith([IO.Path]::GetFullPath($root), [StringComparison]::OrdinalIgnoreCase)) {
      $response.StatusCode = 403
      $bytes = [Text.Encoding]::UTF8.GetBytes("403 Forbidden")
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
      continue
    }

    if (Test-Path $file -PathType Leaf) {
      $bytes = [IO.File]::ReadAllBytes($file)
      $response.StatusCode = 200
      $response.ContentType = Get-ContentType $file
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $bytes = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    }

    $response.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
