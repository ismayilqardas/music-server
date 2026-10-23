
FROM node:18-bullseye

# Python, ffmpeg və asılılıqları quraşdırırıq
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp alətini yeniləyirik
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
{
  "name": "audio-converter-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "yt-dlp-exec": "^2.5.7"
  }
}
const express = require('express');
const cors = require('cors');
const youtubedl = require('yt-dlp-exec');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: "Zəhmət olmasa url parametri daxil edin." });
    }

    try {
        // Video məlumatlarını (adını) oxuyuruq
        const info = await youtubedl(videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true
        });

        const rawTitle = info.title || "Audio";
        const cleanTitle = encodeURIComponent(rawTitle.replace(/[/\\?%*:|"<>]/g, '_'));

        // Başlıqları MP3 axını kimi nizamlayırıq
        res.header('Content-Disposition', `attachment; filename="${cleanTitle}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');

        // yt-dlp ilə birbaşa səs axınını çıxarıb istifadəçiyə göndəririk
        const stream = youtubedl.exec(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: '-'
        });

        stream.stdout.pipe(res);

        stream.stderr.on('data', (data) => {
            console.error(`yt-dlp stderr: ${data}`);
        });

    } catch (err) {
        console.error("Xəta:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Səsi çıxarmaq mümkün olmadı." });
        }
    }
});

app.get('/', (req, res) => {
    res.send("Musiqi Çevirici Server İşləyir!");
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda aktivdir`);
});
