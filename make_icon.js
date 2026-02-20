const { Jimp } = require('jimp');

async function processIcon() {
    try {
        // Load the glossy sphere image
        const image = await Jimp.read('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\ba8b75d4-6087-46a8-80c4-27697c3f2c79\\ag_large_sphere_1771566616425.png');

        // Resize to 256x256 right away to fill the frame
        image.resize({ w: 256, h: 256 });

        const width = image.bitmap.width;
        const height = image.bitmap.height;
        const radius = Math.min(width, height) / 2;

        // Crop it into a perfect circle with transparency outside
        image.scan(0, 0, width, height, function (x, y, idx) {
            const dx = x - width / 2;
            const dy = y - height / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > radius - 1) {
                if (dist > radius) {
                    // Fully transparent outside
                    this.bitmap.data[idx] = 0;       // R
                    this.bitmap.data[idx + 1] = 0;   // G
                    this.bitmap.data[idx + 2] = 0;   // B
                    this.bitmap.data[idx + 3] = 0;   // A
                } else {
                    // Anti-aliasing
                    const alpha = this.bitmap.data[idx + 3] * (radius - dist);
                    this.bitmap.data[idx + 3] = alpha;
                }
            }
        });

        const pathRef = 'e:\\HARRY\\PROJECT\\OPENCODE-CONFIG\\app.png';

        // Save PNG
        image.write(pathRef);
        console.log('PNG processed and saved with FULL glass sphere (no black border)!');

        await new Promise((resolve, reject) => {
            image.getBuffer('image/png', async (err, buffer) => {
                if (err) return reject(err);
                try {
                    const pngToIco = require('png-to-ico');
                    const fs = require('fs');
                    const icoBuf = await pngToIco(buffer);
                    fs.writeFileSync('e:\\HARRY\\PROJECT\\OPENCODE-CONFIG\\app.ico', icoBuf);
                    console.log('ICO file created successfully!');
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    } catch (e) {
        console.error('Error processing icon:', e);
    }
}

processIcon();
