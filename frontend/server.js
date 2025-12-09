const express = require('express');
const { Server } = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

app.use(express.static("public"));

wss.on('connection', (ws) => {
    console.log('Nový klient připojen');

    ws.send(JSON.stringify({ msg: 'Vítej na live metru!' }));

    ws.on('message', (message) => {
        console.log('Zpráva od klienta:', message.toString());
    });
});

server.listen(3001, () => console.log("Listening on port 3001 link 10.122.241.4:3001"));
