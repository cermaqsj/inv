const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'INVENTARIO_FINAL_PARA_SHEETS.csv');
const outPath = path.join(__dirname, '01_APLICACION_WEB', 'products.js');

try {
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');

    // Remove header
    const header = lines.shift();

    const products = lines.map(line => {
        // CSV parsing: handled simple comma separation, respecting quotes if any
        // The format seen is: id,nombre,stock,categoria
        // Some names are quoted like "Producto Existente ..."

        const parts = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                parts.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        parts.push(current);

        const [id, nombre, stock, categoria] = parts;

        return {
            id: id ? id.trim() : "",
            nombre: nombre ? nombre.trim().replace(/^"|"$/g, '') : "",
            stock: stock ? parseInt(stock.trim()) : 0,
            categoria: categoria ? categoria.trim() : ""
        };
    }).filter(p => p.id); // Filter out empty lines

    const jsContent = `/**
 * OFFLINE DATABASE
 * Generated automatically from CSV
 */
const OFFLINE_DB = ${JSON.stringify(products, null, 2)};
`;

    fs.writeFileSync(outPath, jsContent);
    console.log(`Successfully created products.js with ${products.length} items.`);

} catch (err) {
    console.error("Error converting CSV:", err);
}
