$ErrorActionPreference = "Stop"
$OutputDir = Join-Path $PSScriptRoot "qr_codes2"
$IdFile = Join-Path $PSScriptRoot "lista_ids.txt"

# Create Dir if not exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

$ids = Get-Content $IdFile
$total = $ids.Count
$counter = 0

Write-Host "--> Iniciando descarga de $total códigos oficiales a $OutputDir..."

foreach ($id in $ids) {
    if ([string]::IsNullOrWhiteSpace($id)) { continue }
    
    $counter++
    $filePath = Join-Path $OutputDir "$id.png"
    
    # Download always (Fresh Official Copy)
    try {
        Write-Host -NoNewline "`r[Descargando] $id ($counter/$total)   "
        $url = "https://quickchart.io/qr?text=$id&size=300&dark=000000&light=ffffff&margin=1"
        Invoke-WebRequest -Uri $url -OutFile $filePath -UseBasicParsing
    }
    catch {
        Write-Host "`nError bajando $id"
    }
}

Write-Host "`n`n--> COLECCION OFICIAL COMPLETADA!"
