# Live Metro Prague 

Web application displaying **real-time positions of Prague metro trains**
(lines **A, B, C**) on a map using live data from the **Golemio API**.  
![Showcase](img/ukazka2.png)
## Features
- Real-time metro train tracking
- Lines A, B and C
- Animated train movement
- Metro stations visualization
- WebSocket live updates

## Technologies
- Node.js
- Express.js
- WebSocket (ws)
- HTML, CSS, JavaScript
- Golemio API

## Architecture
- **Backend:** Fetches metro data, processes coordinates and broadcasts updates via WebSocket
- **Frontend:** Renders the metro map and animates train movement

## Run
```bash
npm install
node server.js
