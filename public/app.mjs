import * as Y from '../node_modules/yjs/dist/yjs.mjs';
import { WebsocketProvider } from '../node_modules/y-websocket/dist/y-websocket.mjs';

// Initialisation CodeMirror 5
const editorDiv = document.getElementById('editor');
const cm = CodeMirror(editorDiv, {
  value: '',
  lineNumbers: false,
  mode: null,
});
cm.setSize('100%', '400px');

// --- Yjs + y-websocket ---
const ydoc = new Y.Doc();
const provider = new WebsocketProvider('ws://localhost:1234', 'google-doc-demo', ydoc);
const yText = ydoc.getText('codemirror');

let isApplyingRemote = false;

function applyYjsToCM(event) {
  if (isApplyingRemote) return;
  isApplyingRemote = true;
  cm.setValue(yText.toString());
  isApplyingRemote = false;
}
yText.observe(applyYjsToCM);

cm.on('change', (instance, changeObj) => {
  if (isApplyingRemote) return;
  yText.delete(0, yText.length);
  yText.insert(0, instance.getValue());
});

cm.setValue(yText.toString());

// --- Curseurs des autres utilisateurs (bonus simple) ---
const cursorsDiv = document.getElementById('cursors');
const awareness = provider.awareness;

const userId = Math.random().toString(36).substr(2, 9);
awareness.setLocalStateField('user', { id: userId });

function updateCursor() {
  const cursor = cm.getCursor();
  awareness.setLocalStateField('cursor', cursor);
}
cm.on('cursorActivity', updateCursor);

awareness.on('change', () => {
  let html = '';
  awareness.getStates().forEach((state, clientId) => {
    if (state.user && state.cursor && state.user.id !== userId) {
      html += `<div>Utilisateur ${state.user.id.slice(-4)} : ligne ${state.cursor.line + 1}, colonne ${state.cursor.ch + 1}</div>`;
    }
  });
  cursorsDiv.innerHTML = html;
});

updateCursor(); 