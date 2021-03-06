/* globals app, define */
'use strict';

/**
 * Controller for displaying earthquakes on a map
 * Uses Leaflet map library and MapBox as tile source
 * @author Andrei Nekrasov <bonerdelli@gmail.com>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

define('map', ['L', 'HeatmapOverlay', 'earthquake', 'moment', 'message'],
function(L, HeatmapOverlay, earthquake, moment, message) {

  /**
   * Leaflet map options
   */
  var options = {
    mapElementId: 'map',
    // MapBox source options
    mapBox: {
      accessToken: 'pk.eyJ1IjoiYm9uZXJkZWxsaSIsImEiOiJjaWlsY2d5MzYwMDVjdm5tMDhta2N6cXBoIn0.rC98OHIqnN3oQiSnoSKp2g',
      styleBaseUrl: 'https://api.mapbox.com/styles/v1/mapbox/dark-v9'
    },
    // Default map position
    defaultPosition: {
      lon: 37.8,
      lat: -96,
      zoom: 4
    },
    // Styles for vector point markers
    pointMarkerStyle: {
      radius: 2,
      fillColor: '#fff',
      color: '#fff',
      weight: 2,
      opacity: 0.2,
      fillOpacity: 1
    },
    // Options for HeatmapOverlay library
    heatMap: {
      radius: 2,
      maxOpacity: 0.5,
      scaleRadius: true,
      useLocalExtrema: false,
      valueField: 'mag',
      gradient: {
        0.25: '#05f',
        0.40: '#0f3',
        0.75: '#ff0',
        0.98: '#f00',
        // 0.995: '#f0f'
      }
    }
  };

  /**
   * Map controller constructor
   * Initializes map with given options
   */
  var MapController = function(options) {
    this.options = options;
    this.heatmapLayer = null;
    this.pointsLayer = null;
    this.map = null;
  };

  /**
   * Initializes a map
   */

  MapController.prototype.initialize = function() {

    var self = this;
    // Initialize leaflet map
    var map = L.map(options.mapElementId);
    this.map = map;

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
        var content = self.renderFeaturePopup(feature);
        layer.bindPopup(content);
      }
    }).addTo(map);

    // Parse earthquake query response
    earthquake.on('afterQuery', function(data) {
      if (data && data.features && data.features.length) {
        app.log.info('Retrieved features count:', data.features.length);
        // Set a new features data
        self.setData(data);
      } else {
        // Clean if no data was retrieved
        self.cleanData();
      }
    });

    // Do clean when data source was cleaned
    earthquake.on('afterClean', function() {
      self.cleanData();
    });

    this.heatmapLayer = heatmapLayer;
    this.pointsLayer = pointsLayer;
    return true;

  };

  /**
   * Renders feature popup, opened on mouse click
   */
  MapController.prototype.renderFeaturePopup = function(feature) {
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

  /**
   * Sets a new GeoJSON data
   */
  MapController.prototype.setData = function(geoJson) {
    var heatMapData = [];
    // Add data to a point layer
    this.pointsLayer.addData(geoJson);
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
    if (heatMapData && heatMapData.length) {
      // Add data to a head map
      this.heatmapLayer.setData({
        data: heatMapData,
        max: 10,
        min: 0
      });
    } else {
      this.heatmapLayer.setData([]);
    }
  };

  /**
   * Cleans all data
   */
  MapController.prototype.cleanData = function() {
    this.pointsLayer.clearLayers();
    this.heatmapLayer.setData({
      data: []
    });
  };

  // Returns a module
  return new MapController(options);

});
