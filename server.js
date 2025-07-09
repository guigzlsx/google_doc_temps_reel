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

  // Envoie le texte actuel au nouvel arrivant (pour CodeMirror)
  socket.on('cm_update', (data) => {
    currentText = data.value;
    socket.broadcast.emit('cm_update', data);
  });

  socket.on('cm_cursor', (data) => {
    socket.broadcast.emit('cm_cursor', data);
  });

  // Optionnel : envoyer le texte actuel à la connexion
  socket.emit('cm_update', { userId: 'server', value: currentText, cursor: { line: 0, ch: 0 } });

  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
