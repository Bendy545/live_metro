import {fetchMetroCoordinates, all_metro} from './functions.js'
fetchMetroCoordinates().then(res => all_metro());

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('WS: client connected');
});

server.listen(8080, 'localhost', () => {
    console.log('HTTP+WS server on http://0.0.0.0:8080');
});