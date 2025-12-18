const ws = new WebSocket(`ws://${window.location.host}`);

const metroLayer = document.getElementById("metro-layer");
const tooltip = document.getElementById("tooltip");


const trains = {
    A: new Map(),
    B: new Map(),
    C: new Map()
};

const stations = {
    A: new Map(),
    B: new Map(),
    C: new Map()
}

fetch("xy_stations.json")
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        renderStations(data);
        console.log("Stanice načteny a vykresleny");
    })
    .catch(err => console.error("Chyba při načítání stanic:", err));

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

function renderStations(data) {
    Object.keys(data).forEach(line => {
        const lineClass = `line-${line}`;
        data[line].forEach(station => {
            const el = createStationElement(station, lineClass);
            stations[line].set(station.station, {
                element: el,
                data: station
            });
        });
    });
}

function createStationElement(station, lineClass) {
    const el = document.createElement("div");

    el.classList.add("station", lineClass);
    el.style.left = `${station.x}px`;
    el.style.top = `${station.y}px`;

    el.addEventListener("mouseenter", () => {
        const rect = el.getBoundingClientRect(); // <-- změna zde
        tooltip.innerHTML = `<strong>${station.station}</strong>`;
        tooltip.style.left = `${rect.right + 6}px`;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.classList.remove("hidden");
    });

    el.addEventListener("mouseleave", () => {
        tooltip.classList.add("hidden");
    });

    metroLayer.appendChild(el);
    return el;
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

    const currentX = parseFloat(element.style.left) || 0;
    const currentY = parseFloat(element.style.top) || 0;

    const dx = newCoord.x - currentX;
    const dy = newCoord.y - currentY;

    if (dx !== 0 || dy !== 0) {
        let targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        if (!element.dataset.lastAngle) {
            element.dataset.lastAngle = targetAngle;
        }

        let prevAngle = parseFloat(element.dataset.lastAngle);

        while (targetAngle - prevAngle > 180) targetAngle -= 360;
        while (targetAngle - prevAngle < -180) targetAngle += 360;

        element.style.transform = `translate(-50%, -50%) rotate(${targetAngle}deg)`;
        element.dataset.lastAngle = targetAngle;
    }

    element.style.transition = `left ${duration}s linear, top ${duration}s linear, transform ${duration}s linear`;

    element.style.left = `${newCoord.x}px`;
    element.style.top = `${newCoord.y}px`;
}

