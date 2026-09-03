const express = require('express');
const cors = require('cors');
const path = require('path');
const search = require('yt-search');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });
    }

    // Forzar la búsqueda para que siempre agregue "karaoke"
    const searchQuery = query.toLowerCase().includes('karaoke') ? query : `${query} karaoke`;
    
    const r = await search(searchQuery);
    const videos = r.videos.slice(0, 15).map(v => ({
      videoId: v.videoId,
      title: v.title,
      duration: v.timestamp,
      author: v.author.name
    }));

    res.json(videos);
  } catch (error) {
    console.error('Error al buscar en YouTube:', error);
    res.status(500).json({ error: 'Error al buscar videos' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor DJ activo en http://localhost:${PORT}`);
});
