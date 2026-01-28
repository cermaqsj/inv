const fs = require('fs');
const path = require('path');
const https = require('https');

// --- CONFIGURATION ---
// Paste your full Item List here if you want to run offline, 
// OR simpler: we fetch from your App Script URL to get the live list.
const API_URL = 'https://script.google.com/macros/s/AKfycbzpgUkMhdDmLSaejzg_Faql7j-fpojIx0mx98w1sQzl9Wdbfjx1YRdVZij9VLnF5sCK/exec';
const OUTPUT_DIR = path.join(__dirname, 'web', 'qr_codes');

// Create directory if not exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("--> Fetching Inventory from Google Sheets...");

https.get(API_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => { data += chunk; });

    res.on('end', async () => {
        try {
            const products = JSON.parse(data);
            console.log(`--> Found ${products.length} products.`);

            let count = 0;
            for (const p of products) {
                const id = String(p.id).trim();
                if (!id) continue;

                const filePath = path.join(OUTPUT_DIR, `${id}.png`);

                // Skip if exists? (Optional, currently overwriting to be safe)
                // if (fs.existsSync(filePath)) continue;

                await downloadQR(id, filePath);
                count++;
                process.stdout.write(`\r--> Progress: ${count}/${products.length}`);
            }

            console.log("\n\n--> DONE! All QR codes saved in /web/qr_codes");
            console.log("--> Now open the web/index.html and try printing.");

        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});

function downloadQR(id, filepath) {
    return new Promise((resolve, reject) => {
        // Using QuickChart for high quality PNG generation
        const url = `https://quickchart.io/qr?text=${id}&size=300&dark=000000&light=ffffff&margin=1`;

        const file = fs.createWriteStream(filepath);
        https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            // unlink if error
            fs.unlink(filepath, () => { });
            resolve(); // Resolve anyway to continue loop
        });
    });
}
