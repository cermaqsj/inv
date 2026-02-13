$dir = "..\RESPALDO_QR_1000"
$outFile = "..\print_qrs_4x6.html"

# Get files
$files = Get-ChildItem -Path $dir -Filter "*.png" | Sort-Object Name

# HTML Header
$htmlHeader = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Impresión Masiva QR 4x6</title>
    <style>
        @page { 
            size: 4in 6in; 
            margin: 0.2cm; 
        }
        body { 
            margin: 0; 
            padding: 0.2cm; 
            font-family: 'Courier New', monospace; 
            display: flex; 
            flex-wrap: wrap; 
            align-content: flex-start; 
            justify-content: flex-start; 
            gap: 1px;
        }
        .qr-item { 
            width: 1.8cm; /* ~18mm width */
            height: 2.2cm; /* ~22mm height */
            box-sizing: border-box; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            padding: 1px; 
            page-break-inside: avoid; 
            /* border: 1px dashed #eee; Debug border */
        }
        .qr-item img { 
            width: 100%; 
            height: auto; 
            image-rendering: pixelated; 
        }
        .qr-id { 
            font-size: 8px; /* Small font */
            font-weight: bold;
            line-height: 1; 
            margin-top: 1px; 
            text-align: center;
        }
        @media print {
            body { 
                -webkit-print-color-adjust: exact; 
                margin: 0;
            }
        }
    </style>
</head>
<body>
"@

# Generate body
$htmlBody = ""
foreach ($file in $files) {
    $id = $file.BaseName
    # Use relative path assuming html is in PROYECTO and images in PROYECTO/RESPALDO_QR_1000
    $htmlBody += "    <div class='qr-item'><img src='RESPALDO_QR_1000/$($file.Name)' alt='$id'><div class='qr-id'>$id</div></div>`n"
}

$htmlFooter = "</body></html>"

# Write file
$finalHtml = $htmlHeader + $htmlBody + $htmlFooter
Set-Content -Path $outFile -Value $finalHtml -Encoding UTF8

Write-Host "Generated HTML for $($files.Count) files."
