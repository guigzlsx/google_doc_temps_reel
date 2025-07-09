// Remplace tout le code pour utiliser un <textarea> et envoyer des opérations
const socket = io();
const editor = document.getElementById('editor');
let isLocalChange = false;

// Gestion du collage d'images
editor.addEventListener('paste', function (e) {
  if (e.clipboardData) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = function (event) {
          insertImageAtCursor(event.target.result);
        };
        reader.readAsDataURL(file);
        e.preventDefault();
      }
    }
  }
});

// Gestion du glisser-déposer d'images
editor.addEventListener('drop', function (e) {
  e.preventDefault();
  if (e.dataTransfer && e.dataTransfer.files.length) {
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i];
      if (file.type.indexOf('image') !== -1) {
        const reader = new FileReader();
        reader.onload = function (event) {
          insertImageAtCursor(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }
});

// Fonction utilitaire pour insérer une image à la position du curseur
function insertImageAtCursor(src) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const img = document.createElement('img');
  img.src = src;
  img.style.maxWidth = '100%';
  img.style.display = 'block';
  img.style.margin = '12px 0';
  range.insertNode(img);
  // Place le curseur après l'image
  range.setStartAfter(img);
  range.setEndAfter(img);
  sel.removeAllRanges();
  sel.addRange(range);
}

// Envoi du HTML à chaque modification
editor.addEventListener('input', () => {
  isLocalChange = true;
  socket.emit('text_update', editor.innerHTML);
});

// Réception des modifications des autres utilisateurs
socket.on('text_update', (html) => {
  if (!isLocalChange) {
    editor.innerHTML = html;
  }
  isLocalChange = false;
});

// Demander le texte actuel à la connexion
socket.emit('get_text');
socket.on('init_text', (html) => {
  editor.innerHTML = html;
});
