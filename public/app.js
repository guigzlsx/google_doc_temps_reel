const socket = io();

const editor = document.getElementById('editor');
let isLocalChange = false;

// Envoi du texte à chaque modification locale
editor.addEventListener('input', () => {
  isLocalChange = true;
  socket.emit('text_update', editor.value);
});

// Réception des modifications des autres utilisateurs
socket.on('text_update', (text) => {
  if (!isLocalChange) {
    editor.value = text;
  }
  isLocalChange = false;
});
