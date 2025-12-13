const ws = new WebSocket(`ws://${window.location.host}`);

const metroLayer = document.getElementById("metro-layer");

ws.onopen = () => {
    console.log("Připojeno k WebSocket serveru");
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data.msg) return;

        if (data.A || data.B || data.C) {
            renderMetro(data);
        }
    } catch (err) {
        console.error("Chyba při zpracování dat:", err);
    }
};

function renderMetro(data) {
    metroLayer.innerHTML = '';

    if (data.A) {
        data.A.forEach(coord => createTrainElement(coord, 'line-A'));
    }

    if (data.B) {
        data.B.forEach(coord => createTrainElement(coord, 'line-B'));
    }

    if (data.C) {
        data.C.forEach(coord => createTrainElement(coord, 'line-C'));
    }
}

function createTrainElement(coord, lineClass) {
    const train = document.createElement("div");

    train.classList.add("train");
    train.classList.add(lineClass);

    train.style.left = `${coord.x}px`;
    train.style.top = `${coord.y}px`;

    train.title = `X: ${coord.x}, Y: ${coord.y}`;

    metroLayer.appendChild(train);
}