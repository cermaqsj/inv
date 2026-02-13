$dir = "..\RESPALDO_QR_1000"
$outFile = "..\FICHAS_IMPRESION.html"

# Get files
$files = Get-ChildItem -Path $dir -Filter "*.png" | Sort-Object Name

# HTML Header
$htmlHeader = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fichas QR Cermaq (1000 Unidades)</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap');

        @page {
            size: A4;
            margin: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background: #eee;
            margin: 0;
            padding: 20px;
        }

        .page {
            background: white;
            width: 210mm;
            height: 297mm;
            padding: 10mm 5mm;
            margin: 0 auto 20px auto;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(7, 1fr);
            gap: 2mm;
            box-sizing: border-box;
            page-break-after: always;
            overflow: hidden;
        }

        .card {
            border: 1px dotted #ccc;
            padding: 2px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            height: 100%;
        }

        .card img {
            width: 28mm;
            height: 28mm;
            image-rendering: -webkit-optimize-contrast;
        }

        .card .id-text {
            font-size: 14px;
            font-weight: 700;
            color: #000;
            margin-top: 2px;
            font-family: monospace;
        }

        .card .label-text {
            font-size: 7px;
            color: #444;
            margin-bottom: 2px;
            text-transform: uppercase;
        }

        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
                -webkit-print-color-adjust: exact;
            }

            .page {
                margin: 0;
                box-shadow: none;
                border: none;
                page-break-after: always;
                width: 210mm;
                height: 296mm;
            }

            .no-print {
                display: none !important;
            }
        }

        .no-print {
            text-align: center;
            margin-bottom: 2rem;
            padding: 1rem;
            background: #dbeafe;
            border-radius: 8px;
            color: #1e40af;
        }
    </style>
</head>
<body>

    <div class="no-print">
        <h1>Lista de QRs Bodega (1000 Unidades)</h1>
        <p><b>CERMAQ</b></p>
    </div>
"@

$htmlBody = ""
$itemsPerPage = 28
$count = 0

foreach ($file in $files) {
    if ($count % $itemsPerPage -eq 0) {
        if ($count -gt 0) { $htmlBody += "    </div>`n" }
        $htmlBody += "    <div class='page'>`n"
    }

    $id = $file.BaseName
    $htmlBody += @"
        <div class="card">
            <div class="label-text">CERMAQ</div>
            <img src="RESPALDO_QR_1000/$($file.Name)">
            <div class="id-text">$id</div>
        </div>
"@
    $count++
}

# Close last page div
if ($count -gt 0) { $htmlBody += "    </div>`n" }

$htmlFooter = "</body></html>"

$finalHtml = $htmlHeader + $htmlBody + $htmlFooter
Set-Content -Path $outFile -Value $finalHtml -Encoding UTF8

Write-Host "Generated HTML for $($files.Count) items."
