var geoData = {
    "More Boring": {
        "color": "#9ad841ff",
        "value": 0, // This will be replaced by the calculated average
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    },
    "More Depressing": {
        "color": "#20918cff",
        "value": 0,
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    },
    "Wealthier": {
        "color": "#3bba76ff",
        "value": 0,
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    },
    "Livelier": {
        "color": "#31b480ff",
        "value": 0,
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    },
    "More Beautiful": {
        "color": "#20a487ff",
        "value": 0,
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    },
    "Safer": {
        "color": "#f0e620ff",
        "value": 0,
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    }
};

// --- Grid and Value Generation ---
var startLat = 13.755;
var startLng = 100.505;
var cellSize = 0.0005;
var gridSize = 10; // We are creating a 10x10 grid

// Create the grid of 100 cells
for (var i = 0; i < gridSize; i++) {
    for (var j = 0; j < gridSize; j++) {
        var lat = startLat + i * cellSize;
        var lng = startLng + j * cellSize;

        // Define the polygon for the current cell
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

        // For each category, create a feature for this cell with a random value
        for (var category in geoData) {
            var newFeature = JSON.parse(JSON.stringify(polygon));
            
            // Assign a random value between 0.00 and 10.00 to this specific cell
            var randomValue = parseFloat((Math.random() * 10).toFixed(2));
            newFeature.properties.value = randomValue;
            
            // Add the new cell feature to the corresponding category
            geoData[category].data.features.push(newFeature);
        }
    }
}

// --- Calculate Average Score for Each Category ---
// This makes the data compatible with the charts and AI analysis prompt.
for (var category in geoData) {
    let totalValue = 0;
    
    // Sum up the values of all 100 cells for the category
    geoData[category].data.features.forEach(feature => {
        totalValue += feature.properties.value;
    });
    
    // Calculate the average and update the top-level 'value' property for the category
    geoData[category].value = (totalValue / (gridSize * gridSize)).toFixed(2);
}
