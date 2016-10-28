/* globals L */
'use strict';

(function(L) {

  var options = {
    mapbox: {
      accessToken: 'pk.eyJ1IjoiYm9uZXJkZWxsaSIsImEiOiJjaWlsY2d5MzYwMDVjdm5tMDhta2N6cXBoIn0.rC98OHIqnN3oQiSnoSKp2g',
      styleBaseUrl: 'https://api.mapbox.com/styles/v1/mapbox/light-v9'
    },
    defaultMapPosition: {
      lon: 37.8,
      lat: -96,
      zoom: 4
    }
  };

  // Initialize leaflet map
  var map = L.map('map');

  // Set coordinates & center of a map
  map.setView([
    options.defaultMapPosition.lon,
    options.defaultMapPosition.lat
  ], options.defaultMapPosition.zoom);

  // Add MapBox layer (OSM-based)
  L.tileLayer(options.mapbox.styleBaseUrl + '/tiles/256/{z}/{x}/{y}?access_token=' + options.mapbox.accessToken, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>'
  }).addTo(map);

})(L);
