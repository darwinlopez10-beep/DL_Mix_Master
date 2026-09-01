const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const yts = require('yt-search');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
    const r = await yts(query + ' karaoke');
    const videos = r.videos.slice(0, 25);
    const formatted = videos.map(v => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error buscando en YouTube:', error);
    res.status(500).json([]);
  }
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
