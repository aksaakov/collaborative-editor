// const express = require('express');
// const path = require('path'); 

// const app = express();
// const port = process.env.PORT || 3001;
// const DIST_DIR = path.join(__dirname, './build'); 
// const HTML_FILE = path.join(DIST_DIR, '.index.html'); 
// const mockResponse = {
//   foo: 'bar',
//   bar: 'foo'
// };
// app.use(express.static(DIST_DIR));
// app.get('/api', (req, res) => {
//   res.send(mockResponse);
// });
// app.get('/', (req, res) => {
//  res.sendFile(HTML_FILE); // EDIT
// });
// app.listen(port, function () {
//  console.log('Server is running on port: ' + port);
// });

var path = require('path');
var express = require('express');

var app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.set('port', process.env.PORT || 8080);

var server = app.listen(app.get('port'), function() {
  console.log('listening on port ', server.address().port);
});

// // Object.assign(global, { WebSocket: require('ws') });
// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 2222 });

// wss.on('connection', function connection(ws) {
//   console.log('ws. connected.')
// });

