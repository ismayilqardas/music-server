const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/download', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: "Zəhmət olmasa url parametri daxil edin." });
    }

    // Əvvəlcə videonun başlığını əldə edirik
    const getTitle = spawn('yt-dlp', ['--get-title', '--no-warnings', videoUrl]);
    let titleData = '';

    getTitle.stdout.on('data', (chunk) => {
        titleData += chunk.toString();
    });

    getTitle.on('close', (code) => {
        let cleanTitle = "audio";
        if (titleData.trim()) {
            cleanTitle = encodeURIComponent(titleData.trim().replace(/[/\\?%*:|"<>]/g, '_'));
        }

        res.header('Content-Disposition', `attachment; filename="${cleanTitle}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');

        // yt-dlp ilə birbaşa MP3 axını çıxarıb res-ə yönləndiririk
        const ytdlp = spawn('yt-dlp', [
            '-x',
            '--audio-format', 'mp3',
            '-o', '-',
            videoUrl
        ]);

        ytdlp.stdout.pipe(res);

        ytdlp.stderr.on('data', (err) => {
            console.error(`yt-dlp stderr: ${err}`);
        });

        ytdlp.on('error', (err) => {
            console.error("yt-dlp başlama xətası:", err);
            if (!res.headersSent) {
                res.status(500).json({ error: "Daxili çevirmə xətası baş verdi." });
            }
        });
    });
});

app.get('/', (req, res) => {
    res.send("Musiqi Çevirici Server İşləyir!");
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda aktivdir`);
});
