const ws = new WebSocket(`ws://${window.location.host}`);

const metroLayer = document.getElementById("metro-layer");

const trains = {
    A: [],
    B: [],
    C: []
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

function calculateDistance(pos1, pos2) {
    return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2)
    );
}

function updateLine(lineName, newPositions, lineClass) {
    const currentTrains = trains[lineName];
    const usedNewPositions = new Set();
    const usedCurrentTrains = new Set();

    currentTrains.forEach((train, currentIndex) => {
        let closestIndex = -1;
        let closestDistance = Infinity;

        newPositions.forEach((newPos, newIndex) => {
            if (usedNewPositions.has(newIndex)) return;

            const distance = calculateDistance(train.position, newPos);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = newIndex;
            }
        });

        if (closestIndex !== -1 && closestDistance < 200) {
            usedNewPositions.add(closestIndex);
            usedCurrentTrains.add(currentIndex);
            animateTrainTo(train.element, newPositions[closestIndex]);
            train.position = newPositions[closestIndex];
        }
    });

    for (let i = currentTrains.length - 1; i >= 0; i--) {
        if (!usedCurrentTrains.has(i)) {
            currentTrains[i].element.remove();
            currentTrains.splice(i, 1);
        }
    }

    newPositions.forEach((newPos, index) => {
        if (!usedNewPositions.has(index)) {
            const trainElement = createTrainElement(newPos, lineClass);
            currentTrains.push({
                element: trainElement,
                position: newPos
            });
        }
    });
}

function createTrainElement(coord, lineClass) {
    const train = document.createElement("div");

    train.classList.add("train");
    train.classList.add(lineClass);

    train.style.left = `${coord.x}px`;
    train.style.top = `${coord.y}px`;

    train.title = `X: ${coord.x}, Y: ${coord.y}`;

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