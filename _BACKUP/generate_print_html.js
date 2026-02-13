const fs = require('fs');
const path = require('path');

const qrDir = path.join(__dirname, 'RESPALDO_QR_1000');
const outputFile = path.join(__dirname, 'print_qrs_4x6.html');

try {
    const files = fs.readdirSync(qrDir).filter(f => f.toLowerCase().endsWith('.png'));

    let html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Impresión Masiva QR 4x6</title>
    <style>
        @page {
            size: 4in 6in; /* Tamaño postal/foto 10x15cm */
            margin: 0.2cm;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: monospace;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            justify-content: flex-start;
            background: white;
        }
        .qr-item {
            width: 1.8cm; /* Ajustado para caber ~5-6 por fila en 10cm */
            height: 2.2cm;
            /* border: 1px dotted #ccc;  Guía de corte opcional */
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1px;
            page-break-inside: avoid;
            margin-bottom: 2px;
        }
        .qr-item img {
            width: 100%;
            height: auto;
            image-rendering: pixelated;
        }
        .qr-id {
            font-size: 8px; /* Texto pequeño pero legible */
            line-height: 1;
            margin-top: 1px;
        }
        /* Ajuste para impresión */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
`;

    files.forEach(file => {
        const id = file.replace('.png', '');
        html += `
    <div class="qr-item">
        <img src="RESPALDO_QR_1000/${file}" alt="${id}">
        <div class="qr-id">${id}</div>
    </div>`;
    });

    html += `
</body>
</html>`;

    fs.writeFileSync(outputFile, html);
    console.log(`Successfully generated ${outputFile} with ${files.length} QR codes.`);

} catch (e) {
    console.error("Error:", e);
}
