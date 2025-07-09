const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

let currentText = '';

io.on('connection', (socket) => {
  // Envoie le texte actuel au nouvel arrivant
  socket.on('get_text', () => {
    socket.emit('init_text', currentText);
  });

  socket.on('text_update', (html) => {
    currentText = html;
    socket.broadcast.emit('text_update', html);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
