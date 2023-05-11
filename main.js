/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>` ,
        maxZoom: 12
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations,
    "Temperature": themaLayer.temperature.addTo(map),
}).addTo(map);

layerControl.expand();

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

function writeStationLayer(jsondata){
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/icons.png',
                    iconSize: [32, 37],
                    iconAnchor: [16, 37], //Positionierung vom Icon
                    popupAnchor: [0, -37], //popup versetzen
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;

            let pointInTime = new Date (prop.date);
            //console.log(pointInTime);
            layer.bindPopup(`<h3>${prop.name}, ${feature.geometry.coordinates[2]} m </h3><br> 
                            <b>Lufttemperatur: </b> ${prop.LT ? prop.LT + " °C" : "nicht verfügbar"} <br>
                            <b>Relative Luftfeuchte: </b>${prop.RH ? prop.RH + " %" : "nicht verfügbar"} <br>
                            <b>Windgeschwindigkeit:</b> ${prop.WG ? (prop.WG * 3.6) .toFixed(1) + " km/h" : "nicht verfügbar"} <br>
                            <b>Schneehöhe: </b>${prop.HS ? prop.HS + " cm" : "nicht verfügbar"}<br><br>
                            <span>${pointInTime.toLocaleString()}</span>
                            `);
        }
    }).addTo(themaLayer.stations);

}

function writeTemperatureLayer(jsondata){
    L.geoJSON(jsondata, {
        filter: function(feature){
            if (feature.properties.LT > -50 && feature.properties.LT < 50) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                   html:`<span>${feature.properties.LT.toFixed(1)}</span>`
                })
            });
        },
        
    }).addTo(themaLayer.temperature);

}

//Wetterstationen, Temperatur
async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    writeStationLayer(jsondata);
    writeTemperatureLayer(jsondata);
}
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");
