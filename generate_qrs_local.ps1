
# Script para descargar QRs masivamente de forma robusta
# Se conecta a tu API de Google Apps Script para obtener la lista

$ApiUrl = "https://script.google.com/macros/s/AKfycbzpgUkMhdDmLSaejzg_Faql7j-fpojIx0mx98w1sQzl9Wdbfjx1YRdVZij9VLnF5sCK/exec"
$OutputDir = Join-Path $PSScriptRoot "web\qr_codes"

# Crear directorio si no existe
if (!(Test-Path -Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "Creado directorio: $OutputDir" -ForegroundColor Green
}

Write-Host "1. Obteniendo lista de productos..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $ApiUrl -Method Get
    $count = $response.Count
    Write-Host "-> Encontrados $count productos." -ForegroundColor Green
}
catch {
    Write-Host "Error conectando a la API: $_" -ForegroundColor Red
    exit
}

$current = 0

foreach ($prod in $response) {
    $id = "$($prod.id)".Trim()
    
    # Validar ID
    if ([string]::IsNullOrWhiteSpace($id)) { continue }

    $fileName = "$id.png"
    $filePath = Join-Path $OutputDir $fileName
    $current++

    # Saltar si ya existe (para reanudar rápido)
    if (Test-Path $filePath) {
        Write-Host "[$current/$count] $id -> YA EXISTE (Saltando)" -ForegroundColor Gray
        continue
    }

    # URL de generación (goqr.me es rápida y estable)
    $qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=$id"

    try {
        Write-Host "[$current/$count] Descargando QR para $id..." -NoNewline
        Invoke-WebRequest -Uri $qrUrl -OutFile $filePath
        Write-Host "OK" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR" -ForegroundColor Red
        # Podríamos intentar reintentar, pero mejor seguir y el usuario re-ejecuta para los fallidos
    }
    
    # Pequeña pausa para no ser bloqueados por la API
    Start-Sleep -Milliseconds 100
}

Write-Host "`nPROCESO COMPLETADO." -ForegroundColor Green
Write-Host "Los códigos están en: $OutputDir"
