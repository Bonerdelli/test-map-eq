/* globals L, HeatmapOverlay, promise */
'use strict';

;(function(L, HeatmapOverlay, promise, log) {

  var options = {
    mapBox: {
      accessToken: 'pk.eyJ1IjoiYm9uZXJkZWxsaSIsImEiOiJjaWlsY2d5MzYwMDVjdm5tMDhta2N6cXBoIn0.rC98OHIqnN3oQiSnoSKp2g',
      styleBaseUrl: 'https://api.mapbox.com/styles/v1/mapbox/light-v9'
    },
    defaultPosition: {
      lon: 37.8,
      lat: -96,
      zoom: 4
    },
    pointMarkerStyle: {
      radius: 5,
      fillColor: '#ff7800',
      color: '#fff',
      weight: 1,
      opacity: 0,
      fillOpacity: 0.6
    },
    heatMap: {
      radius: 2,
      maxOpacity: 0.8,
      scaleRadius: true,
      useLocalExtrema: true,
      latField: 'lat',
      lngField: 'lng',
      valueField: 'count'
    }
  };

  // Initialize leaflet map
  var map = L.map('map');

  // Set coordinates & center of a map
  map.setView([
    options.defaultPosition.lon,
    options.defaultPosition.lat
  ], options.defaultPosition.zoom);

  // Add MapBox layer (OSM-based)
  L.tileLayer(options.mapBox.styleBaseUrl + '/tiles/256/{z}/{x}/{y}?access_token=' + options.mapBox.accessToken, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>'
  }).addTo(map);

  // Initialize heatmap layer
  // var heatmapLayer = new HeatmapOverlay(options.heatMap).addTo(map);

  // Initialize vector layer with a points
  var pointsLayer = L.geoJSON(undefined, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, options.pointMarkerStyle);
    }
  }).addTo(map);

  // Requesting GeoJSON data
  var apiUrl = 'http://earthquake.usgs.gov/fdsnws/event/1/query';
  promise.get(apiUrl, {
    format:    'geojson',
    eventtype: 'earthquake',
    starttime: '2014-01-01',
    endtime:   '2014-01-02',
  }).then(function(error, response, xhr) {
    if (error) {
      log.error('Error requesting features data', xhr.status);
    } else {
      var featuresData;
      try {
        featuresData = JSON.parse(response);
      } catch (e) {
        log.error('Error parsing features data', e);
      }
      // Add data to a point layer
      pointsLayer.addData(featuresData);
    }
  });

})(L, HeatmapOverlay, promise, console);
