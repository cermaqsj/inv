
# Script para descargar el código QR de registro de herramientas
# URL destino: https://cermaqsj.github.io/inv/registro_herramientas.html

$url = "https://cermaqsj.github.io/inv/registro_herramientas.html"
$outputFile = "herramientasqr.png"
$qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + [System.Web.HttpUtility]::UrlEncode($url)

# Add System.Web for UrlEncode if not available (rare in modern PS but good practice)
if (-not ("System.Web.HttpUtility" -as [type])) {
    Add-Type -AssemblyName System.Web
    $qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + [System.Web.HttpUtility]::UrlEncode($url)
}

Write-Host "Generando QR para: $url"
Write-Host "Descargando imagen..."

try {
    Invoke-WebRequest -Uri $qrApiUrl -OutFile $outputFile
    Write-Host "Éxito! Imagen guardada como: $outputFile" -ForegroundColor Green
} catch {
    Write-Error "Error al descargar el QR: $_"
}
