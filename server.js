const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));
// Sert les fichiers .mjs avec le bon type MIME pour les imports ES modules
app.use("/node_modules", (req, res, next) => {
  if (req.path.endsWith(".mjs")) {
    res.type("application/javascript");
  }
  next();
});
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

let currentText = "";

io.on("connection", (socket) => {
  console.log("[serveur] Nouveau client connecté, id :", socket.id);
  // Envoie le texte actuel au nouvel arrivant
  socket.on("get_text", () => {
    console.log(
      "[serveur] get_text reçu de",
      socket.id,
      "| currentText =",
      currentText
    );
    socket.emit("init_text", currentText);
  });

  // Nouvelle gestion : opérations atomiques
  socket.on("operation", (op) => {
    // Appliquer l'opération à currentText
    if (op.type === "insert") {
      currentText =
        currentText.slice(0, op.pos) + op.value + currentText.slice(op.pos);
    } else if (op.type === "delete") {
      currentText =
        currentText.slice(0, op.pos) + currentText.slice(op.pos + op.length);
    }
    // Diffuser l'opération aux autres clients
    socket.broadcast.emit("operation", op);
  });

  socket.on("disconnect", () => {
    console.log("[serveur] Client déconnecté, id :", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
