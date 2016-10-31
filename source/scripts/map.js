/* globals L, HeatmapOverlay, promise */
'use strict';

;(function(L, HeatmapOverlay, promise, log) {

  var options = {
    mapElementId: 'map',
    mapBox: {
      accessToken: 'pk.eyJ1IjoiYm9uZXJkZWxsaSIsImEiOiJjaWlsY2d5MzYwMDVjdm5tMDhta2N6cXBoIn0.rC98OHIqnN3oQiSnoSKp2g',
      styleBaseUrl: 'https://api.mapbox.com/styles/v1/mapbox/dark-v9'
    },
    defaultPosition: {
      lon: 37.8,
      lat: -96,
      zoom: 4
    },
    pointMarkerStyle: {
      radius: 2,
      fillColor: '#fff',
      color: '#fff',
      weight: 2,
      opacity: 0.2,
      fillOpacity: 1
    },
    heatMap: {
      radius: 2,
      maxOpacity: 0.8,
      scaleRadius: true,
      useLocalExtrema: false,
      valueField: 'mag',
      gradient: {
        0.15: '#05f',
        0.35: '#0f3',
        0.55: '#ff0',
        0.75: '#f00'
      }
    }
  };

  // Initialize leaflet map
  var map = L.map(options.mapElementId);

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
  var heatmapLayer = new HeatmapOverlay(options.heatMap).addTo(map);

  // Initialize vector layer with a points
  var pointsLayer = L.geoJSON(undefined, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, options.pointMarkerStyle);
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup(feature.properties.place);
    }
  }).addTo(map);

  /**
   * Sets a new data from GeoJSON
   */
  var setData = function(geoJson) {
    var heatMapData = [];
    // Add data to a point layer
    pointsLayer.addData(geoJson);
    // Prepare data for a heat map
    for (var i = 0; i < geoJson.features.length; i++) {
      var item = geoJson.features[i];
      if (!item.geometry || item.geometry.type !== 'Point') {
        continue; // Omit non-point fearures
      }
      if (!item.properties.mag) {
        continue; // Omit items without magnitude data
      }
      heatMapData.push({
        lat: item.geometry.coordinates[1],
        lng: item.geometry.coordinates[0],
        // Scale Richter magnitude to a 0..1 range
        mag: item.properties.mag / 10
      });
    }
    // Add data to a head map
    heatmapLayer.setData({
      data: heatMapData
    });
  };

  /**
   * Cleans all data
   */
  var cleanData = function() {
    pointsLayer.clearLayers();
    heatmapLayer.setData([]);
  };

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
      if (featuresData.features.length) {
        // Set a new data
        setData(featuresData);
      } else {
        // Clean if no data was retrieved
        cleanData();
      }

    }
  });

})(L, HeatmapOverlay, promise, console);
