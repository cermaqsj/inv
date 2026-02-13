$dir = "..\RESPALDO_QR_1000"
$outFile = "..\INDICE_REFERENCIA.html"

# Get files
$files = Get-ChildItem -Path $dir -Filter "*.png" | Sort-Object Name

# HTML Header
$htmlHeader = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Índice de Referencia - Filas vs ID</title>
    <style>
        body { font-family: sans-serif; margin: 2rem; background: #f9fafb; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 8px; }
        h1 { color: #1e3a8a; text-align: center; margin-bottom: 2rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; color: #374151; font-weight: 700; }
        tr:hover { background: #f9fafb; }
        .row-num { font-weight: bold; color: #6b7280; width: 80px; }
        .id-num { font-family: monospace; font-size: 1.1rem; color: #111; font-weight: 700; }
        .btn-print { 
            display: block; width: 100%; padding: 1rem; margin-bottom: 1rem; 
            background: #2563eb; color: white; text-align: center; 
            text-decoration: none; border-radius: 6px; font-weight: bold;
        }
        @media print {
            .btn-print { display: none; }
            body { margin: 0; background: white; }
            .container { box-shadow: none; margin: 0; width: 100%; max-width: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Índice de Referencia<br><span style="font-size: 1rem; color: #666; font-weight: normal;">Ordenado por ID</span></h1>
        <a href="#" onclick="window.print()" class="btn-print">Imprimir Lista</a>
        <table>
            <thead>
                <tr>
                    <th># Fila</th>
                    <th>ID Código</th>
                    <th>Ubicación Aprox. (Google Sheet)</th>
                </tr>
            </thead>
            <tbody>
"@

$htmlBody = ""
$count = 1

foreach ($file in $files) {
    $id = $file.BaseName
    # Sheet Row = Item Index + 1 (Header) + 1 (1-based) = Index + 2
    # But usually user thinks "Item 1" = Row 2.
    $sheetRow = $count + 1
    
    $htmlBody += @"
                <tr>
                    <td class="row-num">$count</td>
                    <td class="id-num">$id</td>
                    <td style="color: #666;">Fila $sheetRow</td>
                </tr>
"@
    $count++
}

$htmlFooter = @"
            </tbody>
        </table>
    </div>
</body>
</html>
"@

$finalHtml = $htmlHeader + $htmlBody + $htmlFooter
Set-Content -Path $outFile -Value $finalHtml -Encoding UTF8

Write-Host "Generated Index for $($files.Count) items."
