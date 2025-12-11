import fs from "fs";
const API_URL_A = "https://api.golemio.cz/v2/vehiclepositions?offset=0&routeShortName=A";
const API_URL_B = "https://api.golemio.cz/v2/vehiclepositions?offset=0&routeShortName=B";
const API_URL_C = "https://api.golemio.cz/v2/vehiclepositions?offset=0&routeShortName=C";
const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDI1MiwiaWF0IjoxNzY1NDU1NjY2LCJleHAiOjExNzY1NDU1NjY2LCJpc3MiOiJnb2xlbWlvIiwianRpIjoiZjYzZjE4MWMtNDkxMS00MTE0LWFiZDItNjJiNGQzNjVjMjE4In0.Ppf8hlImHGgfDnynXo7IAo-XaQ_qiHcvGluzB8UfK9M";

function coordToXY(lat, lon) {
    const bounds = {
        lat_min: 50.02,
        lat_max: 50.13,
        lon_min: 14.29,
        lon_max: 14.58
    };

    const imgWidth = 1024;
    const imgHeight = 724;

    const x = ((lon - bounds.lon_min) / (bounds.lon_max - bounds.lon_min)) * imgWidth;
    const y = ((bounds.lat_max - lat) / (bounds.lat_max - bounds.lat_min)) * imgHeight;

    return { x: Math.round(x), y: Math.round(y) };
}

export function all_metro(){
    const rawDataA = fs.readFileSync("metro_A.json", "utf-8");
    const rawDataB = fs.readFileSync("metro_B.json", "utf-8");
    const rawDataC = fs.readFileSync("metro_C.json", "utf-8");
    const coordinatesA = JSON.parse(rawDataA);
    const coordinatesB= JSON.parse(rawDataB);
    const coordinatesC = JSON.parse(rawDataC);

    const A = coordinatesA.map(([lon, lat]) => {
        return coordToXY(lat, lon);
    });
    const B = coordinatesB.map(([lon, lat]) => {
        return coordToXY(lat, lon);
    });
    const C = coordinatesC.map(([lon, lat]) => {
        return coordToXY(lat, lon);
    });

    fs.writeFileSync("xy_Metro.json", JSON.stringify({A, B, C}, null, 2));
    console.log("Saved xy_Metro.json with pixel coordinates of metro lines");
}

export async function fetchMetroCoordinates() {
    try {
        const resA = await fetch(API_URL_A, {
            headers: { "X-Access-Token": API_TOKEN }
        });
        const resB = await fetch(API_URL_B, {
            headers: { "X-Access-Token": API_TOKEN }
        });
        const resC = await fetch(API_URL_C, {
            headers: { "X-Access-Token": API_TOKEN }
        });

        const dataA = await resA.json();
        const dataB = await resB.json();
        const dataC = await resC.json();

        const coordinatesA = dataA.features?.map(f => f.geometry.coordinates) ?? [];
        const coordinatesB = dataB.features?.map(f => f.geometry.coordinates) ?? [];
        const coordinatesC = dataC.features?.map(f => f.geometry.coordinates) ?? [];

        fs.writeFileSync("metro_A.json", JSON.stringify(coordinatesA, null, 2));
        fs.writeFileSync("metro_B.json", JSON.stringify(coordinatesB, null, 2));
        fs.writeFileSync("metro_C.json", JSON.stringify(coordinatesC, null, 2));

        console.log("Saved metro_A.json, metro_B.json, metro_C.json");
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}


