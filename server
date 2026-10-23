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
