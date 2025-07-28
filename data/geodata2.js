<script src="https://unpkg.com/h3-js"></script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<div id="map" style="height: 600px;"></div>

<script>
// ---- Configuration ----
const categories = [
  "More Boring",
  "More Depressing",
  "Wealthier",
  "Livelier",
  "More Beautiful",
  "Safer"
];

// H3 resolution (smaller = bigger hexagons, larger = smaller hexagons)
const h3Resolution = 8;

// Map center
const center = [13.755, 100.505];

// Value -> color function
function getColor(value) {
  if (value < 2) return "#f7fcf0";
  if (value < 4) return "#ccebc5";
  if (value < 6) return "#7bccc4";
  if (value < 8) return "#2b8cbe";
  return "#08589e";
}

// ---- Generate hexagons ----
let hexFeatures = [];
const lat = center[0];
const lng = center[1];

// Generate a disk of hexagons around the center
const hexIndexes = h3.gridDisk(h3.latLngToCell(lat, lng, h3Resolution), 3);

hexIndexes.forEach(h3Index => {
    const hexBoundary = h3.cellToBoundary(h3Index, true);

    // Pick random category + random value
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomValue = parseFloat((Math.random() * 10).toFixed(2));

    // Create GeoJSON feature
    hexFeatures.push({
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [[...hexBoundary, hexBoundary[0]]]
        },
        properties: {
            category: randomCategory,
            value: randomValue,
            color: getColor(randomValue)
        }
    });
});

// ---- Make FeatureCollection ----
const hexGeoJSON = {
    type: "FeatureCollection",
    features: hexFeatures
};

// ---- Display on Leaflet ----
const map = L.map("map").setView(center, 14);

// Base map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
}).addTo(map);

// Add hex polygons with colors
L.geoJSON(hexGeoJSON, {
    style: feature => ({
        color: "#555",
        weight: 1,
        fillColor: feature.properties.color,
        fillOpacity: 0.7
    }),
    onEachFeature: (feature, layer) => {
        layer.bindPopup(
            `Category: ${feature.properties.category}<br>` +
            `Value: ${feature.properties.value}`
        );
    }
}).addTo(map);

</script>
