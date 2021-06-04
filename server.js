/**
 * @type {any}
 */

 const express = require('express');
 const path = require('path'); // NEW
 
 const app = express();
 const host = process.env.HOST || 'localhost'
 const httpPort = process.env.PORT || 8080;
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
 app.listen(httpPort, function () {
  console.log('App listening on port: ' + httpPort);
 });

 
 const WebSocket = require('ws')
 const http = require('http')
 const wss = new WebSocket.Server({ noServer: true })
 const setupWSConnection = require('./server-utils.js').setupWSConnection
 
 const port = process.env.PORT || 3002;
 
 const server = http.createServer((request, response) => {
   response.writeHead(200, { 'Content-Type': 'text/plain' })
   response.end('okay')
 })
 
 wss.on('connection', setupWSConnection)
 
 server.on('upgrade', (request, socket, head) => {
   // You may check auth of request here..
   /**
    * @param {any} ws
    */
   const handleAuth = ws => {
     wss.emit('connection', ws, request)
   }
   wss.handleUpgrade(request, socket, head, handleAuth)
 })
 
 server.listen({ host, port })
 
 console.log(`Websocket running at '${host}' on port ${port}`)