const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;
const ip = "localhost";

registerFont('./GenJyuuGothic-Medium.ttf', { family: 'GenJyuuGothic-Medium' });

if (process.argv[2] === '-server') {
    //好きなapi
    app.get('/generate', async (req, res) => {
        try {
            const text = req.query.text || 'テスト\nテキスト';
            const subtitle = req.query.title || 'サブタイトル';
            const imagePath = await generateImage(text.replace(/\\n/g, '\n'), subtitle);
            res.sendFile(imagePath);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error generating image');
        }
    });

    app.listen(port, () => {
        console.log(`App listening at http://${ip}:${port}`);
    });
} else {
    // cli
    const text = process.argv[2] ? process.argv[2].replace(/\\n/g, '\n') : 'んご\nごごご';
    const subtitle = process.argv[3] || '好きなapi発表ドラゴン';

    generateImage(text, subtitle).then(() => {
        console.log('Image generated: output.png');
    }).catch(err => {
        console.error('Error generating image:', err);
    });
}

async function generateImage(text, subtitle) {
    const originalImage = await loadImage('./original.png');

    const canvas = createCanvas(originalImage.width, originalImage.height);
    const context = canvas.getContext('2d');

    // 秒画
    context.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    context.font = '90px "GenJyuuGothic-Medium", sans-serif';
    context.fillStyle = 'black';
    const scriptLines = text.split('\n');
    if (scriptLines.length === 1) {
        context.fillText(text, 175 + (500 - context.measureText(text).width) / 2, 358);
    } else if (scriptLines.length === 2) {
        context.fillText(scriptLines[0], 175 + (500 - context.measureText(scriptLines[0]).width) / 2, 295);
        context.fillText(scriptLines[1], 175 + (500 - context.measureText(scriptLines[1]).width) / 2, 422);
    }
    context.font = '77px "GenJyuuGothic-Medium", sans-serif';
    context.fillText(subtitle, (canvas.width - context.measureText(subtitle).width) / 2, 844);


    // 好きな〇〇ドラゴンを出力（）
    const outputPath = __dirname + '/output.png';
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    return new Promise((resolve, reject) => {
        out.on('finish', () => resolve(outputPath));
        out.on('error', reject);
    });
}

/* usage:
 1. Command Line Interface: node app.js "てきすと\nテキスト" "たいとる"
 2. Server: node app.js -server (and visit http://localhost:3000/generate?text=テスト/nてきすと&title=たいとる)
*/