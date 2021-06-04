const express = require('express');
const path = require('path'); // NEW

const app = express();
const port = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, './build'); // NEW
const HTML_FILE = path.join(DIST_DIR, '.index.html'); // NEW
const mockResponse = {
  foo: 'bar',
  bar: 'foo'
};
app.use(express.static(DIST_DIR)); // NEW
app.get('/api', (req, res) => {
  res.send(mockResponse);
});
app.get('/', (req, res) => {
 res.sendFile(HTML_FILE); // EDIT
});
app.listen(port, function () {
 console.log('App listening on port: ' + port);
});

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 1235 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});