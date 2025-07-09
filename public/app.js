const socket = io();

function sendMessage() {
  const input = document.getElementById('message');
  socket.emit('message', input.value);
  input.value = '';
}

socket.on('message', (msg) => {
  const li = document.createElement('li');
  li.textContent = msg;
  document.getElementById('messages').appendChild(li);
});
