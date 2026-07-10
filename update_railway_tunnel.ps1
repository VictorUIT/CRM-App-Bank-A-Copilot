# update_railway_tunnel.ps1
# Script tự động đọc URL tunnel của 9router và update Railway env var qua CLI
# Chạy mỗi khi tunnel URL thay đổi (sau khi 9router restart)

$StateFile = "$env:APPDATA\9router\tunnel\state.json"

# 1. Đọc tunnel URL từ 9router state
if (-not (Test-Path $StateFile)) {
    Write-Host "ERROR: 9router state file not found" -ForegroundColor Red
    exit 1
}

$state = Get-Content $StateFile | ConvertFrom-Json
$tunnelUrl = $state.tunnelUrl
$apiBase = "$tunnelUrl/v1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Tunnel URL moi cua 9router:" -ForegroundColor Cyan
Write-Host " $tunnelUrl" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

# 2. Test tunnel
Write-Host "Kiem tra tunnel..." -ForegroundColor Gray
try {
    $r = Invoke-WebRequest -Uri "$tunnelUrl/v1/models" -TimeoutSec 10 -EA Stop
    Write-Host "Tunnel OK (status: $($r.StatusCode))" -ForegroundColor Green
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
        Write-Host "Tunnel ACTIVE (401 = can auth)" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Tunnel co the chet. Loi: $($_.Exception.Message)" -ForegroundColor Yellow
        $cont = Read-Host "Tiep tuc cap nhat Railway khong? (y/n)"
        if ($cont -ne 'y') { exit 1 }
    }
}

# 3. Update Railway via CLI
Write-Host ""
Write-Host "Dang update Railway OPENAI_API_BASE..." -ForegroundColor Yellow
$result = railway variables set "OPENAI_API_BASE=$apiBase" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Railway da duoc cap nhat!" -ForegroundColor Green
    Write-Host "OPENAI_API_BASE = $apiBase" -ForegroundColor White
    Write-Host ""
    Write-Host "Railway se tu dong redeploy trong ~2 phut." -ForegroundColor Cyan
} else {
    Write-Host "Loi khi update Railway: $result" -ForegroundColor Red
    Write-Host "Hay cap nhat thu cong tren Railway Dashboard:" -ForegroundColor Yellow
    Write-Host "OPENAI_API_BASE = $apiBase" -ForegroundColor White
}

