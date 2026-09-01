const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const YouTube = require('youtube-sr').default;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
    const results = await YouTube.search(query + ' karaoke', { limit: 12, type: 'video' });
    const formatted = results.map(v => ({
      videoId: v.id,
      title: v.title,
      thumbnail: v.thumbnail ? v.thumbnail.url : `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`
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
