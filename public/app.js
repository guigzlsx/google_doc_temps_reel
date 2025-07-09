const socket = io();

// Génère un id unique pour chaque utilisateur (session locale)
const userId = Math.random().toString(36).substr(2, 9);

// Initialisation CodeMirror 5
const editorDiv = document.getElementById('editor');
const cm = CodeMirror(editorDiv, {
  value: '',
  lineNumbers: false, // Désactive les numéros de ligne
  mode: null,         // Texte brut
});
cm.setSize('100%', '400px');

// Synchronisation du texte et du curseur
let isLocalChange = false;

cm.on('change', (instance, changeObj) => {
  if (!isLocalChange) {
    const value = instance.getValue();
    const cursor = instance.getCursor();
    socket.emit('cm_update', {
      userId,
      value,
      cursor,
    });
  }
});

cm.on('cursorActivity', (instance) => {
  const cursor = instance.getCursor();
  socket.emit('cm_cursor', {
    userId,
    cursor,
  });
});

// Réception des modifications des autres utilisateurs
socket.on('cm_update', (data) => {
  if (data.userId !== userId) {
    isLocalChange = true;
    cm.setValue(data.value);
    cm.setCursor(data.cursor);
    isLocalChange = false;
  }
});

// Gestion des curseurs des autres utilisateurs
const cursorsDiv = document.getElementById('cursors');
let otherCursors = {};

socket.on('cm_cursor', (data) => {
  if (data.userId !== userId) {
    otherCursors[data.userId] = data.cursor;
    updateCursorsDisplay();
  }
});

function updateCursorsDisplay() {
  let html = '';
  for (const [id, cursor] of Object.entries(otherCursors)) {
    html += `<div>Utilisateur ${id.slice(-4)} : ligne ${cursor.line + 1}, colonne ${cursor.ch + 1}</div>`;
  }
  cursorsDiv.innerHTML = html;
}
