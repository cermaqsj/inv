
# QR Backup Script
# Fetches inventory from Google Script and downloads QR PNGs

$API_URL = "https://script.google.com/macros/s/AKfycby1-qTOq2NTBeBUsmElu3sl11j1Y79FXgUS_KbIqz5Y1gglz1ggBvaiQqWJoeG5bOp1Zw/exec?action=getInventario"
$OUT_DIR = "..\RESPALDO_QR_1000"

# 1. Create Directory
if (!(Test-Path -Path $OUT_DIR)) {
    New-Item -ItemType Directory -Path $OUT_DIR | Out-Null
    Write-Host "Created directory: $OUT_DIR" -ForegroundColor Green
}

# 2. Fetch Data
Write-Host "Fetching product list from Google..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $API_URL -Method Get
    Write-Host "Received $($response.Count) products." -ForegroundColor Green
} catch {
    Write-Error "Failed to fetch data: $_"
    exit
}

# 3. Loop and Download
$i = 0
foreach ($item in $response) {
    if ($item.id) {
        $id = $item.id
        $cleanId = $id -replace '[^a-zA-Z0-9_-]', '' # Sanitize filename
        $file = "$OUT_DIR\$cleanId.png"
        
        if (!(Test-Path $file)) {
            $qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$id"
            try {
                Invoke-WebRequest -Uri $qrUrl -OutFile $file
                $i++
                Write-Progress -Activity "Downloading QRs" -Status "$id ($i of $($response.Count))" -PercentComplete (($i / $response.Count) * 100)
            } catch {
                Write-Host "Failed to download $id" -ForegroundColor Red
            }
            
            # Sleep slightly to be polite to the API
            Start-Sleep -Milliseconds 100
        }
    }
}

Write-Host "Done! Downloaded $i new QR codes to $OUT_DIR" -ForegroundColor Green
