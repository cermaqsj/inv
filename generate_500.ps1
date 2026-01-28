$ErrorActionPreference = "Stop"
$TargetCount = 500
$OutputDir = Join-Path $PSScriptRoot "qr_codes"
$CsvFile = Join-Path $PSScriptRoot "base_datos_completa.csv"

# Create Dir
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

# 1. Scan Existing
Write-Host "--> Escaneando carpeta actual..."
$ExistingFiles = Get-ChildItem -Path $OutputDir -Filter "*.png"
$ExistingIds = @{}
foreach ($file in $ExistingFiles) {
    $id = $file.BaseName
    $ExistingIds[$id] = $true
}

Write-Host "--> Encontrados: $($ExistingIds.Count) códigos existentes."

# 2. Generate IDs
$AllIds = [System.Collections.ArrayList]@($ExistingIds.Keys)
$GeneratedCount = 0

Write-Host "--> Generando nuevos IDs..."

while ($AllIds.Count -lt $TargetCount) {
    # Generate random 6 digit ID (100000 - 999999)
    $rnd = Get-Random -Minimum 100000 -Maximum 999999
    $newId = "$rnd"
    
    if (-not $ExistingIds.ContainsKey($newId) -and -not $AllIds.Contains($newId)) {
        [void]$AllIds.Add($newId)
        $GeneratedCount++
    }
}

Write-Host "--> Generados $GeneratedCount nuevos IDs. Total: $($AllIds.Count)"

# 3. Process
$csvContent = "id,nombre,stock,categoria`r`n"
$counter = 0

foreach ($id in $AllIds) {
    $counter++
    
    # CSV Data
    $name = if ($ExistingIds.ContainsKey($id)) { "Producto Existente $id" } else { "Producto $id" }
    $stock = Get-Random -Minimum 0 -Maximum 100
    $csvContent += "$id,`"$name`",$stock,GENERADO`r`n"

    # Download PNG if missing
    $filePath = Join-Path $OutputDir "$id.png"
    if (-not (Test-Path $filePath)) {
        try {
            Write-Host -NoNewline "`r[Descargando] $id ($counter/$TargetCount)   "
            $url = "https://quickchart.io/qr?text=$id&size=300&dark=000000&light=ffffff&margin=1"
            Invoke-WebRequest -Uri $url -OutFile $filePath -UseBasicParsing
        } catch {
            Write-Host "`nError bajando $id"
        }
    } else {
        Write-Host -NoNewline "`r[Existe] $id ($counter/$TargetCount)   "
    }
}

# Write CSV with UTF8 encoding
[System.IO.File]::WriteAllText($CsvFile, $csvContent, [System.Text.Encoding]::UTF8)

Write-Host "`n`n--> ¡PROCESO FINALIZADO!"
Write-Host "--> CSV guardado en: $CsvFile"
