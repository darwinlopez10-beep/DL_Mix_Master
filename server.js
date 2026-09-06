const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const ytSearch = require('yt-search');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query vacia' });

  try {
    const r = await ytSearch(query);
    const videos = r.videos.slice(0, 15).map(v => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      author: v.author.name,
      timestamp: v.timestamp
    }));
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Error realizando busqueda' });
  }
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
