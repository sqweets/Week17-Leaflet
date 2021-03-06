

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
}),
greyscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-basic",
  accessToken: API_KEY
}),
outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});


// Color hex values
var zeroToOne = "#B7F34D";
var oneToTwo = "#E1F34C";
var twoToThree = "#F3DB4E";
var threeToFour = "#F3BA4E";
var fourToFive = "#F0A66B";
var fivePlus = "#EF6B6B";
var circleColor;

// Get the colors for the legend
function getLegendColor(level) {

  var legendColor;

  if (level == 6) {
    legendColor = fivePlus;
  } else if (level == 5) {
    legendColor = fourToFive;
  } else if (level == 4) {
    legendColor = threeToFour;
  } else if (level == 3) {
    legendColor = twoToThree;
  } else if (level == 2) {
    legendColor = oneToTwo;
  } else if (level == 1) {
    legendColor = zeroToOne;
  }

  return legendColor;
}

// Get circle colors
function getCircleColor(magnitude) {

  if (magnitude >= 5) {
    circleColor = fivePlus;
  } else if (magnitude >= 4) {
    circleColor = fourToFive;
  } else if (magnitude >= 3) {
    circleColor = threeToFour;
  } else if (magnitude >= 2) {
    circleColor = twoToThree;
  } else if (magnitude >= 1) {
    circleColor = oneToTwo;
  } else if (magnitude >= 0) {
    circleColor = zeroToOne;
  }

  return circleColor;
}


//*****************************************************************************
// The convertTimestamp function is from https://gist.github.com/kmaida/6045266
//*****************************************************************************
// I removed the convert to milliseconds (*1000) because these timestamps are
// already in milliseconnds.
// Used for the popup
function convertTimestamp(timestamp) {
  var d = new Date(timestamp), // Convert the passed timestamp to milliseconds - NOT NEEDED
    yyyy = d.getFullYear(),
    mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
    dd = ('0' + d.getDate()).slice(-2),     // Add leading 0.
    hh = d.getHours(),
    h = hh,
    min = ('0' + d.getMinutes()).slice(-2),   // Add leading 0.
    ampm = 'AM',
    time;
      
  if (hh > 12) {
    h = hh - 12;
    ampm = 'PM';
  } else if (hh === 12) {
    h = 12;
    ampm = 'PM';
  } else if (hh == 0) {
    h = 12;
  }
  
  // ie: 2013-02-18, 8:35 AM  
  time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm + ' ' + 'CDT';
    
  return time;
}


// Define a markerSize function
function circleSize(magnitude) {
  return magnitude * 20000;
}

// Create the Earthquake circles
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var oneCircle;
var circleLayer = L.layerGroup();

// Get the data (This url is for all earthquakes within the last 7 days)
d3.json(url, function(response) {

  var features = response.features;
  //console.log(features);

  var location = [];
  var magnitude = [];
  var dateTime = [];
  var place = []; 

  for (var j = 0; j < features.length; j++) {
    location.push([features[j].geometry.coordinates[1], features[j].geometry.coordinates[0]]);
    magnitude.push(features[j].properties.mag);
    dateTime.push(features[j].properties.time)
    place.push(features[j].properties.place);
  }

  // Make the circles
  for (var i = 0; i < location.length; i++) {

  oneCircle = L.circle(location[i], {
      color: 'grey',
      fillColor: getCircleColor(magnitude[i]),
      fillOpacity: 0.95,
      weight: 1,
      radius: circleSize(magnitude[i])
    }).bindPopup("<h1>Earthquake</h1> <hr> <h3>Magnitude: " + magnitude[i] +  "</h3><h3>Where: " + place[i] + "</h3><h3>When: " + convertTimestamp(dateTime[i]) + "</h3>").addTo(myMap);

    oneCircle.addTo(circleLayer);
  }

});

// Get the plate data
var plates;
var plateLayer = L.geoJSON();

d3.json("resources/PB2002_boundaries.json", function(plate_data) {

  plates = plate_data.features;
  for (var k = 0; k < plates.length; k++) {
    plateLayer.addData(plates[k]);
  }
});

// Create the map object
var myMap = L.map('map', {
      center: [40.7608, -111.8910],
      zoom: 4,
      layers: [satellite, circleLayer, plateLayer]
});

var baseMaps = {
    "Satellite": satellite,
    "Greyscale": greyscale,
    "Outdoors": outdoors
};

var overlayMaps = {
    "Earthquakes": circleLayer,
    "Fault Lines": plateLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Create legend control
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
      magnitudes = [0, 1, 2, 3, 4, 5],
      labels = [];

  // loop through our magnitudes and generate a label with a colored square for each interval
  for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getLegendColor(magnitudes[i] + 1) + '"></i> ' +
          magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
  }

  return div;
}

// Add legend conntrol
legend.addTo(myMap);





