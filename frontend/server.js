import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

app.use(express.static("public"));

const metroWS = new WebSocket("ws://localhost:8080");

metroWS.on("open", () => {
    console.log("Připojeno k externímu metro WebSocket serveru.");
});

metroWS.on("message", (data) => {
    try {
        const json = JSON.parse(data.toString());
        console.log("Data z metra:", json);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(json));
            }
        });
    } catch (err) {
        console.error("Neplatný JSON:", err);
    }
});

wss.on("connection", (ws) => {
    console.log("Nový klient připojen");
    ws.send(JSON.stringify({ msg: "Vítej na live metru!" }));
});

server.listen(3001, () => console.log("Listening on port 3001"));
