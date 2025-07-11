const socket = io();
const editor = document.getElementById("editor");
let isLocalChange = false;

// Envoi du HTML à chaque modification
editor.addEventListener("input", () => {
  isLocalChange = true;
  socket.emit("text_update", editor.innerHTML);
});

// Réception des modifications des autres utilisateurs
socket.on("text_update", (html) => {
  if (!isLocalChange) {
    editor.innerHTML = html;
  }
  isLocalChange = false;
});

// Demander le texte actuel à la connexion
socket.emit("get_text");
socket.on("init_text", (html) => {
  editor.innerHTML = html;
});
