/* globals L, HeatmapOverlay, EarthquakeResource, moment */
'use strict';

/**
 * Earthquake map controller
 * @author Andrei Nekrasov <bonerdelli@gmail.com>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

var MapController = (function(L, HeatmapOverlay, EarthquakeResource, moment, log) {

  /**
   * Leaflet map options
   */
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
        0.25: '#05f',
        0.40: '#0f3',
        0.75: '#ff0',
        0.98: '#f00'
      }
    }
  };

  // Factory object
  var MapController = {};

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

  var renderFeaturePopup = function(feature) {
    var html = '<dl class="data-list">';
    var props = feature.properties;
    var fields = [{
      title: 'Магнитуда',
      value: '<strong>' + props.mag + '</strong>'
    }, {
      title: 'Код события',
      value: '<a href="' + props.url + '" target="_blank">' +
              props.code + '</a>'
    }, {
      title: 'Дата и время',
      value: moment(props.time).format('LLL')
    }, {
      title: 'Место',
      value: props.place
    }];
    for (var i = 0; i < fields.length; i++) {
      html += '<dt>' + (fields[i].title || '&nbsp;') + '</dt>' +
              '<dd>' + fields[i].value + '</dd>';
    }
    html += '<dl>';
    return html;
  };

  // Initialize vector layer with a points
  var pointsLayer = L.geoJSON(undefined, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, options.pointMarkerStyle);
    },
    onEachFeature: function(feature, layer) {
      var content = renderFeaturePopup(feature);
      layer.bindPopup(content);
    }
  }).addTo(map);

  /**
   * Sets a new data from GeoJSON
   */
  MapController.setData = function(geoJson) {
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
        mag: item.properties.mag
      });
    }
    // Add data to a head map
    heatmapLayer.setData({
      data: heatMapData,
      max: 10,
      min: 0
    });
  };

  /**
   * Cleans all data
   */
  MapController.cleanData = function() {
    pointsLayer.clearLayers();
    heatmapLayer.setData([]);
  };

  // Registering callback for earthquake resource
  EarthquakeResource.doAfterQuery(function(data) {
    if (data.features.length) {
      log.info('Retrieved features count:', data.features.length);
      // Set a new features data
      MapController.setData(data);
    } else {
      // Clean if no data was retrieved
      MapController.cleanData();
    }
  });

  // Quering data at startup
  EarthquakeResource.query();

  // Returns factory object
  return MapController;

})(L, HeatmapOverlay, EarthquakeResource, moment, console);
