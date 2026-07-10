# update_railway_tunnel.ps1
# Script tự động đọc URL tunnel hiện tại của 9router và update Railway env var
# Chạy mỗi khi tunnel URL thay đổi

param(
    [string]$RailwayToken = "",
    [string]$ServiceId = ""  
)

$StateFile = "$env:APPDATA\9router\tunnel\state.json"

# 1. Đọc tunnel URL từ 9router state
if (-not (Test-Path $StateFile)) {
    Write-Host "ERROR: 9router state file not found at $StateFile" -ForegroundColor Red
    exit 1
}

$state = Get-Content $StateFile | ConvertFrom-Json
$tunnelUrl = $state.tunnelUrl

if (-not $tunnelUrl) {
    Write-Host "ERROR: No tunnel URL found in state.json" -ForegroundColor Red
    exit 1
}

$apiBase = "$tunnelUrl/v1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 9router Tunnel URL (hiện tại):" -ForegroundColor Cyan
Write-Host " $tunnelUrl" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPENAI_API_BASE = $apiBase" -ForegroundColor Yellow
Write-Host ""

# 2. Test tunnel có hoạt động không
Write-Host "Testing tunnel..." -ForegroundColor Gray
try {
    $r = Invoke-WebRequest -Uri "$tunnelUrl/v1/models" -TimeoutSec 10 -EA Stop
    Write-Host "Tunnel OK (status: $($r.StatusCode))" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "Tunnel ACTIVE - requires auth (401 expected)" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Tunnel might be dead. Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Đây là các bước cần làm trên Railway Dashboard:" -ForegroundColor White
Write-Host "1. Vào: https://railway.app -> Project -> Service Backend" -ForegroundColor Gray
Write-Host "2. Tab Variables -> Edit OPENAI_API_BASE" -ForegroundColor Gray  
Write-Host "3. Giá trị mới: $apiBase" -ForegroundColor Green
Write-Host ""
Write-Host "Nhấn Enter để copy URL vào clipboard..." -ForegroundColor Cyan
$null = Read-Host
Set-Clipboard -Value $apiBase
Write-Host "Da copy: $apiBase" -ForegroundColor Green
