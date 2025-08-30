import http from 'http';
import app from './App.js';
import { PORT } from './utils/configs.js';
import { WebSocketServer } from 'ws';

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Websocket client connected');
  ws.on('close', () => console.log('Websocket client disconnected'));
});

export const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
};

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
