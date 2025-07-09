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
  console.log('Un client est connecté');

  // Envoie le texte actuel au nouvel arrivant
  socket.emit('text_update', currentText);

  socket.on('text_update', (text) => {
    currentText = text;
    socket.broadcast.emit('text_update', text);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
