const fs = require('fs');
const path = require('path');
const https = require('https');

// --- CONFIGURATION ---
const TARGET_COUNT = 500;
const OUTPUT_DIR = path.join(__dirname, 'qr_codes');
const CSV_FILE = path.join(__dirname, 'base_datos_completa.csv');

// Create directory if not exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 1. Scan existing IDs
console.log("--> Escaneando carpeta actual...");
const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
const existingIds = new Set(existingFiles.map(f => f.replace('.png', '')));

console.log(`--> Encontrados: ${existingIds.size} códigos existentes.`);

// 2. Generate new IDs until 500
const allIds = Array.from(existingIds);
let generatedCount = 0;

// Helper to generate random 6-digit ID (safe range for varied inventory)
function generateId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

console.log("--> Generando nuevos IDs...");

while (allIds.length < TARGET_COUNT) {
    const newId = generateId();
    if (!existingIds.has(newId) && !allIds.includes(newId)) {
        allIds.push(newId);
        generatedCount++;
    }
}

console.log(`--> Generados ${generatedCount} nuevos IDs. Total: ${allIds.length}`);

// 3. Download Process
async function run() {
    const csvStream = fs.createWriteStream(CSV_FILE);
    csvStream.write('id,nombre,stock,categoria\n'); // Header

    let processed = 0;

    for (const id of allIds) {
        // Add to CSV (Generic name for new ones, or preserve if we had metadata - here we assume all need entry)
        const name = existingIds.has(id) ? `Producto Existente ${id}` : `Producto ${id}`;
        const stock = Math.floor(Math.random() * 100); // Random initial stock
        csvStream.write(`${id},"${name}",${stock},GENERADO\n`);

        // Check if PNG exists
        const filePath = path.join(OUTPUT_DIR, `${id}.png`);
        if (!fs.existsSync(filePath)) {
            try {
                await downloadQR(id, filePath);
                process.stdout.write(`\r[Descargando] ${id} (${processed + 1}/${allIds.length})`);
            } catch (e) {
                console.error(`\nError bajando ${id}:`, e.message);
            }
        } else {
            // Already exists
            process.stdout.write(`\r[Existe] ${id} (${processed + 1}/${allIds.length})`);
        }
        processed++;
    }

    csvStream.end();
    console.log("\n\n--> ¡PROCESO FINALIZADO!");
    console.log(`--> CSV guardado en: ${CSV_FILE}`);
    console.log(`--> Imágenes en: ${OUTPUT_DIR}`);
}

function downloadQR(id, filepath) {
    return new Promise((resolve, reject) => {
        // High quality QR from QuickChart
        const url = `https://quickchart.io/qr?text=${id}&size=300&dark=000000&light=ffffff&margin=1`;

        const file = fs.createWriteStream(filepath);
        https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { }); // Delete partial
            reject(err);
        });
    });
}

run();
