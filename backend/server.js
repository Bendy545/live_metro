import {fetchMetroCoordinates, all_metro} from './functions.js'
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import fs from "fs";

async function updateLoop() {
    try {
        await fetchMetroCoordinates();
        all_metro();
    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(updateLoop, 10000);
    }
}

updateLoop();

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
    console.log('WS: client connected');
    const data = fs.readFileSync("xy_Metro.json", "utf-8");
    ws.send(data);
});


server.listen(8080, 'localhost', () => {
    console.log('HTTP+WS server on http://localhost:8080');
});