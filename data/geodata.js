var geoDataCategories = [
    "More Boring",
    "More Depressing",
    "Wealthier",
    "Livelier",
    "More Beautiful",
    "Safer"
];

var startLat = 13.755;
var startLng = 100.505;
var cellSize = 0.0005;
var gridSize = 10; // 10x10 grid

var gridFeatures = [];

for (var i = 0; i < gridSize; i++) {
    for (var j = 0; j < gridSize; j++) {
        var lat = startLat + i * cellSize;
        var lng = startLng + j * cellSize;

        var polygon = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [lng, lat],
                        [lng + cellSize, lat],
                        [lng + cellSize, lat + cellSize],
                        [lng, lat + cellSize],
                        [lng, lat]
                    ]
                ]
            },
            "properties": {}
        };

        // Pick a random category
        var randomCategory =
            geoDataCategories[
                Math.floor(Math.random() * geoDataCategories.length)
            ];

        // Assign a random value
        var randomValue = parseFloat((Math.random() * 10).toFixed(2));

        polygon.properties.category = randomCategory;
        polygon.properties.value = randomValue;

        gridFeatures.push(polygon);
    }
}

var gridGeoJSON = {
    "type": "FeatureCollection",
    "features": gridFeatures
};

console.log(JSON.stringify(gridGeoJSON));
