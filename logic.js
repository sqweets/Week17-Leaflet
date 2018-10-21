// Create a map object
var myMap = L.map('map').setView([40.7608, -111.8910], 5);  // Salt Lake City

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-basic",
  accessToken: API_KEY
}).addTo(myMap);

// Color hex values
var zeroToOne = "#B7F34D";
var oneToTwo = "#E1F34C";
var twoToThree = "#F3DB4E";
var threeToFour = "#F3BA4E";
var fourToFive = "#F0A66B";
var fivePlus = "#EF6B6B";

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

// Define a markerSize function
function markerSize(magnitude) {
  return magnitude * 20000;
}


//*****************************************************************************
// The convertTimestamp function is from https://gist.github.com/kmaida/6045266
//*****************************************************************************
// I removed the convert to milliseconds (*1000) because these timestamps are
// already in milliseconnds.
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

// Create the circles
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get the data (This url is for all earthquakes within the last 7 days)
d3.json(url, function(response) {

  var circleColor;
  var features = response.features;
  console.log(features);

  var location = [];
  var magnitude = [];
  var dateTime = [];
  var place = [];

  for (var j = 0; j < features.length; j++) {
    location.push([features[j].geometry.coordinates[1], features[j].geometry.coordinates[0]]);
    magnitude.push(features[j].properties.mag);
    dateTime.push(features[j].properties.time);
    place.push(features[j].properties.place);
  }

  for (var i = 0; i < location.length; i++) {

    // Figure color
    if (magnitude[i] >= 5) {
      circleColor = fivePlus;
    } else if (magnitude[i] >= 4) {
      circleColor = fourToFive;
    } else if (magnitude[i] >= 3) {
      circleColor = threeToFour;
    } else if (magnitude[i] >= 2) {
      circleColor = twoToThree;
    } else if (magnitude[i] >= 1) {
      circleColor = oneToTwo;
    } else if (magnitude[i] >= 0) {
      circleColor = zeroToOne;
    }


    L.circle(location[i], {
      color: 'grey',
      fillColor: circleColor,
      fillOpacity: 0.95,
      weight: 1,
      radius: markerSize(magnitude[i])
    }).bindPopup("<h1>Earthquake</h1> <hr> <h3>Magnitude: " + magnitude[i] +  "</h3><h3>Where: " + place[i] + "</h3><h3>When: " + convertTimestamp(dateTime[i]) + "</h3>").addTo(myMap);
  }

});

