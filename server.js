// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files (like your client HTML/JS)
app.use(express.static(__dirname + '/public'));

let players = {};

io.on('connection', (socket) => {
  console.log('New client connected: ' + socket.id);

  // Create a new player and add to players object
  players[socket.id] = { 
    x: 0,
    y: 0,
    radius: 20,
    // ... any other properties
  };

  // Send the current players to the new client
  socket.emit('currentPlayers', players);

  // Notify other clients about the new player
  socket.broadcast.emit('newPlayer', { id: socket.id, playerData: players[socket.id] });

  // Listen for movement updates from the client
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      // Broadcast the player's movement to everyone except the sender
      socket.broadcast.emit('playerMoved', { id: socket.id, x: movementData.x, y: movementData.y });
    }
  });

  // Remove player when they disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
