$(document).ready(function() {
    // Initialize the map
    var map = L.map('map', {
        center: [13.755745525490369, 100.50624120648544],
        zoom: 17,
        zoomControl: true,
        preferCanvas: false,
    });

    // Add tile layer
    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            "attribution": "\u0026copy; \u003ca href=\"https://www.openstreetmap.org/copyright\"\u003eOpenStreetMap\u003c/a\u003e contributors \u0026copy; \u003ca href=\"https://carto.com/attributions\"\u003eCARTO\u003c/a\u003e",
            "detectRetina": false,
            "maxNativeZoom": 20,
            "maxZoom": 20,
            "minZoom": 0,
            "noWrap": false,
            "opacity": 1,
            "subdomains": "abcd",
            "tms": false
        }
    ).addTo(map);

    var layers = {};
    var chartContainer = d3.select("#chart-container");

    // --- Chart Creation and Layer Setup ---
    for (var key in geoData) {
        if (geoData.hasOwnProperty(key)) {
            var categoryData = geoData[key];
            var layerName = key;
            var chartId = "chart-" + layerName.replace(/\s+/g, '-');

            var layer = L.geoJson(categoryData.data, {
                style: function(feature) {
                    return { color: "black", fillColor: categoryData.color, fillOpacity: 0.6, weight: 0.2 };
                }
            });
            layer.bindTooltip(`<div>${layerName}: ${categoryData.value}</div>`, {"sticky": true});
            layer.options.layerName = layerName;
            layers[layerName] = layer;

            createBarChart(chartContainer, chartId, layerName, categoryData);
        }
    }

    // --- Add Layer Control ---
    var layerControl = L.control.layers(null, layers, { collapsed: false }).addTo(map);
    var layerControlContainer = layerControl.getContainer();
    $("#leaflet-control-layers-list").append(layerControlContainer);
    $(layerControlContainer).find('h3').remove(); // Clean up default text if any

    // --- Initial State ---
    var firstLayerName = Object.keys(layers)[0];
    if (layers[firstLayerName]) {
        layers[firstLayerName].addTo(map);
        $('#chart-' + firstLayerName.replace(/\s+/g, '-')).show();
    }
    
    // --- Synchronization Logic ---
    map.on('overlayadd', function(e) {
        var addedLayerName = e.name;
        var chartId = '#chart-' + addedLayerName.replace(/\s+/g, '-');
        $(chartId).slideDown(200);
    });

    map.on('overlayremove', function(e) {
        var removedLayerName = e.name;
        var chartId = '#chart-' + removedLayerName.replace(/\s+/g, '-');
        $(chartId).slideUp(200);
    });

    // --- Gemini AI Analysis ---
    $('#gemini-analyze-btn').on('click', function() {
        var activePerceptions = [];
        for (var layerName in layers) {
            if (map.hasLayer(layers[layerName])) {
                activePerceptions.push(layerName);
            }
        }

        var resultContainer = $('#gemini-result-container');
        var outputDiv = $('#gemini-output');
        var loadingDiv = $('#gemini-loading');

        outputDiv.empty();
        resultContainer.slideDown();

        if (activePerceptions.length === 0) {
            outputDiv.html('<p class="text-danger">Please select at least one perception layer to analyze.</p>');
            return;
        }

        loadingDiv.show();

        const prompt = `You are an expert urban analyst and travel guide. A specific neighborhood is described with the following perceived qualities: ${activePerceptions.join(', ')}.

Based ONLY on these characteristics, please provide:
1. A one-paragraph summary of the neighborhood's likely character and atmosphere.
2. A bulleted list of three specific, creative activity suggestions for someone visiting this area.

Format the response in simple Markdown.`;

        const apiKey = ""; // API key is handled by the environment, no need to add one here.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            loadingDiv.hide();
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts[0].text) {
                const text = data.candidates[0].content.parts[0].text;
                const html = simpleMarkdownToHtml(text);
                outputDiv.html(html);
            } else {
                console.error("Gemini API Error Response:", data);
                outputDiv.html('<p class="text-danger">Sorry, the AI analysis could not be generated. The model returned an empty response.</p>');
            }
        })
        .catch(error => {
            console.error('Error calling Gemini API:', error);
            loadingDiv.hide();
            outputDiv.html('<p class="text-danger">An error occurred while contacting the analysis service.</p>');
        });
    });
});

/**
 * Converts a simple subset of Markdown to HTML.
 * @param {string} markdown - The Markdown text to convert.
 * @returns {string} - The converted HTML.
 */
function simpleMarkdownToHtml(markdown) {
    let finalHtml = markdown.trim()
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.match(/^\s*[\-\*]/)) {
                const items = paragraph.split('\n').map(item => `<li>${item.replace(/^\s*[\-\*]\s*/, '')}</li>`).join('');
                return `<ul>${items}</ul>`;
            }
            return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
        }).join('');

    return finalHtml;
}


/**
 * Creates a simple horizontal bar chart for a perception category.
 * @param {d3.Selection} container - The D3 selection of the container to append the chart to.
 * @param {string} chartId - The ID for the new chart's div.
 * @param {string} layerName - The name of the category (e.g., "More Boring").
 * @param {object} categoryData - The data object for the category { color, value, data }.
 */
function createBarChart(container, chartId, layerName, categoryData) {
    var margin = {top: 5, right: 20, bottom: 5, left: 5},
        width = 280 - margin.left - margin.right,
        height = 50 - margin.top - margin.bottom;

    var x = d3.scale.linear().domain([0, 10]).range([0, width]);

    var chartDiv = container.append('div')
        .attr('id', chartId)
        .attr('class', 'chart')
        .style('display', 'none');

    chartDiv.append('p').attr('class', 'axis-label mb-1').text(layerName);

    var svg = chartDiv.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('rect')
        .attr('class', 'bar')
        .attr('width', x(categoryData.value))
        .attr('height', height)
        .style('fill', categoryData.color)
        .attr('rx', 3).attr('ry', 3);

    svg.append('text')
        .attr('class', 'bar-label')
        .attr('x', x(categoryData.value) / 2)
        .attr('y', height / 2)
        .attr('dy', '.35em')
        .text(categoryData.value);
}
