// Remplace tout le code pour utiliser un <textarea> et envoyer des opérations
const socket = io();
const editor = document.getElementById("editor");
let lastValue = editor.value;
let isApplyingRemote = false;

// Fonction utilitaire pour appliquer une opération
function applyOperation(text, op) {
  if (op.type === "insert") {
    return text.slice(0, op.pos) + op.value + text.slice(op.pos);
  } else if (op.type === "delete") {
    return text.slice(0, op.pos) + text.slice(op.pos + op.length);
  }
  return text;
}

// Détecte l'opération entre deux versions de texte (simple, une modif à la fois)
function detectOperation(oldText, newText, selectionStart) {
  if (newText.length > oldText.length) {
    // Insertion
    const diffLen = newText.length - oldText.length;
    const pos = selectionStart - diffLen;
    const value = newText.slice(pos, selectionStart);
    return { type: "insert", pos, value };
  } else if (newText.length < oldText.length) {
    // Suppression
    const diffLen = oldText.length - newText.length;
    const pos = selectionStart;
    return { type: "delete", pos, length: diffLen };
  }
  return null;
}

editor.addEventListener("input", (e) => {
  if (isApplyingRemote) {
    lastValue = editor.value;
    return;
  }
  const op = detectOperation(lastValue, editor.value, editor.selectionStart);
  if (op) {
    socket.emit("operation", op);
  }
  lastValue = editor.value;
});

// Applique les opérations reçues
socket.on("operation", (op) => {
  isApplyingRemote = true;
  const before = editor.value;
  const newValue = applyOperation(before, op);
  const cursor =
    op.type === "insert"
      ? op.pos <= editor.selectionStart
        ? editor.selectionStart + op.value.length
        : editor.selectionStart
      : op.pos < editor.selectionStart
      ? Math.max(editor.selectionStart - op.length, op.pos)
      : editor.selectionStart;
  editor.value = newValue;
  editor.setSelectionRange(cursor, cursor);
  lastValue = newValue;
  isApplyingRemote = false;
});

// Demande le texte actuel à la connexion
socket.emit("get_text");
socket.on("init_text", (text) => {
  isApplyingRemote = true;
  editor.value = text;
  lastValue = text;
  isApplyingRemote = false;
});
