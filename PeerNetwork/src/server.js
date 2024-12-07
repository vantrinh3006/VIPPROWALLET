const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const peers = [];
const socketId2PeerId = {};

// Set up a route handler for the root URL
app.get('/', (req, res) => {
  res.send('Socket server is running.');
});

app.get('/connections', (req, res) => {
  const connectedClients = [];

  // Iterate over all connected sockets
  Object.keys(io.sockets.sockets).forEach((socketId) => {
    const socket = io.sockets.sockets[socketId];

    // Extract relevant data about the client
    const clientData = {
      socketId: socketId,
      ipAddress: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent'],
      // Add more relevant properties as needed
    };

    connectedClients.push(clientData);
  });

  res.json(socketId2PeerId);
});

// Socket.IO connection event handler
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('newPeer', (peerHost) => {
    if (peers.includes(peerHost) === false && peerHost) {
      peers.push(peerHost);
      socketId2PeerId[socket.id] = peerHost;
      io.emit('addPeer', peers);
      console.log(peers);
    }
  });

  // Handle 'disconnect' events
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    const p = socketId2PeerId[socket.id];
    if (peers.indexOf(p) !== -1) {
      peers.splice(peers.indexOf(p), 1);
    }
    delete socketId2PeerId[socket.id];
    io.emit('removePeer', p);
    console.log(peers);
  });
});

// Start the Socket.IO server
const socketIOPort = 4040;
server.listen(socketIOPort, () => {
  console.log(`Socket.IO server is listening on port ${socketIOPort}`);
});
