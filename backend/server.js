import {fetchMetroCoordinates, all_metro} from './functions.js'
import express from "express";
import http from "http";
import { WebSocketServer , WebSocket} from "ws";
import fs from "fs";

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(data) {
    const json = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    });
}

async function updateLoop() {
    try {
        await fetchMetroCoordinates();

        const newData = all_metro();

        broadcast(newData);
    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(updateLoop, 10000);
    }
}

updateLoop();

wss.on('connection', ws => {
    console.log('WS: client connected');
    try {
        if (fs.existsSync("xy_Metro.json")) {
            const data = fs.readFileSync("xy_Metro.json", "utf-8");
            ws.send(data);
        }
    } catch (e) {
        console.error("Chyba při prvním odeslání:", e);
    }
});


server.listen(8080, 'localhost', () => {
    console.log('HTTP+WS server on http://localhost:8080');
});