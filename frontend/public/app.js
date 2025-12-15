const ws = new WebSocket(`ws://${window.location.host}`);

const metroLayer = document.getElementById("metro-layer");
const tooltip = document.getElementById("tooltip");


const trains = {
    A: new Map(),
    B: new Map(),
    C: new Map()
};

ws.onopen = () => {
    console.log("Připojeno k WebSocket serveru");
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data.msg) return;

        if (data.A || data.B || data.C) {
            updateMetroPositions(data);
        }
    } catch (err) {
        console.error("Chyba při zpracování dat:", err);
    }
};

function updateMetroPositions(data) {
    if (data.A) {
        updateLine('A', data.A, 'line-A');
    }
    if (data.B) {
        updateLine('B', data.B, 'line-B');
    }
    if (data.C) {
        updateLine('C', data.C, 'line-C');
    }
}

function updateLine(lineName, newPositions, lineClass) {
    const trainsMap = trains[lineName];
    trainsMap.forEach(train => train.seen = false);
    newPositions.forEach(pos => {
        const id = pos.id;

        if (trainsMap.has(id)) {
            const train = trainsMap.get(id);
            animateTrainTo(train.element, pos);
            train.position = pos;
            train.seen = true;
        } else {

            const el = createTrainElement(pos, lineClass);
            trainsMap.set(id, {
                element: el,
                position: pos,
                seen: true
            });
        }
    });

    trainsMap.forEach((train, id) => {
        if (!train.seen) {
            train.element.remove();
            trainsMap.delete(id);
        }
    });
}

function createTrainElement(coord, lineClass) {
    const train = document.createElement("div");

    train.classList.add("train", lineClass);

    train.style.left = `${coord.x}px`;
    train.style.top = `${coord.y}px`;

    train.addEventListener("mouseenter", () => {
        const rect = train.getBoundingClientRect();

        tooltip.innerHTML = `
            <strong>${coord.heading}</strong><br>
            ID: ${coord.id}
        `;

        tooltip.style.left = `${rect.right + 6}px`;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;

        tooltip.classList.remove("hidden");
    });

    train.addEventListener("mouseleave", () => {
        tooltip.classList.add("hidden");
    });


    metroLayer.appendChild(train);
    return train;
}

function animateTrainTo(element, newCoord) {

    const duration = 10;

    element.style.transition = `left ${duration}s linear, top ${duration}s linear`;
    element.style.left = `${newCoord.x}px`;
    element.style.top = `${newCoord.y}px`;

    element.title = `X: ${newCoord.x}, Y: ${newCoord.y}`;
}