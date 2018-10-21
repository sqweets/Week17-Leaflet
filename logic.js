

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


function getCircleColor(magnitude) {

  // Color hex values
  var zeroToOne = "#B7F34D";
  var oneToTwo = "#E1F34C";
  var twoToThree = "#F3DB4E";
  var threeToFour = "#F3BA4E";
  var fourToFive = "#F0A66B";
  var fivePlus = "#EF6B6B";
  var circleColor;

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

// Define a markerSize function
function markerSize(magnitude) {
  return magnitude * 20000;
}

// Create the circles
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var oneCircle;
var circleLayer = L.layerGroup();

// Get the data (This url is for all earthquakes within the last 7 days)
d3.json(url, function(response) {

  var features = response.features;
  //console.log(features);

  var location = [];
  var magnitude = [];
  var place = []; 

  for (var j = 0; j < features.length; j++) {
    location.push([features[j].geometry.coordinates[1], features[j].geometry.coordinates[0]]);
    magnitude.push(features[j].properties.mag);
    place.push(features[j].properties.place);
  }

  // Make the circles
  for (var i = 0; i < location.length; i++) {

  oneCircle = L.circle(location[i], {
      color: 'grey',
      fillColor: getCircleColor(magnitude[i]),
      fillOpacity: 0.95,
      weight: 1,
      radius: markerSize(magnitude[i])
    }).bindPopup("<h1>Earthquake</h1> <hr> <h3>Magnitude: " + magnitude[i] +  "</h3><h3>Where: " + place[i] + "</h3>").addTo(myMap);

    oneCircle.addTo(circleLayer);
  }

});

// Create the map object
var myMap = L.map('map', {
      center: [40.7608, -111.8910],
      zoom: 5,
      layers: [satellite, circleLayer]
});

var baseMaps = {
    "Satellite": satellite,
    "Greyscale": greyscale,
    "Outdoors": outdoors
};

var overlayMaps = {
    "Earthquakes": circleLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(myMap);



