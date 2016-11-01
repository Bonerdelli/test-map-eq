/* globals promise, moment */
'use strict';

/**
 * Resource for quering earthquake data from http://earthquake.usgs.gov
 * @author Andrei Nekrasov <bonerdelli@gmail.com>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

var EarthquakeResource = (function(promise, moment, log) {

  /**
   * Resource options
   * NOTE: this example doesn't needed global storage for configuration
   */
  var apiUrl = 'http://earthquake.usgs.gov/fdsnws/event/1/query';
  var defaultQueryOptions =  {
    format:    'geojson',
    eventtype: 'earthquake',
    // Request data for a last week by default
    starttime:  moment().subtract(1, 'week').format('YYYY-MM-DD'),
    endtime:    moment().format('YYYY-MM-DD')
  };

  /**
   * A simple object extending method
   */
  var extend = function(target, src) {
    target = target || {};
    for (var prop in src) {
      if (src.hasOwnProperty(prop)) {
        if (typeof src[prop] === 'object') {
          target[prop] = extend(target[prop], src[prop]);
        } else if (typeof src[prop] !== 'undefined') {
          target[prop] = src[prop];
        }
      }
    }
    return target;
  };

  var beforeQueryCallbacks = [];
  var afterQueryCallbacks = [];

  var reloadResource = function(options) {
    var queryOptions = {};
    var deffered = new promise.Promise();
    // Apply callbacks
    beforeQueryCallbacks.forEach(function(callback) {
      callback();
    });
    // Generate options for query
    options = options || {};
    extend(queryOptions, defaultQueryOptions);
    extend(queryOptions, options);
    // Quering API with a given options
    promise.get(apiUrl, queryOptions).then(
      function(error, response, xhr) {
        var data = [];
        if (error) {
          // Reject deffered promise if no data was retrieved
          log.error('Error requesting features data', xhr.status);
        } else {
          try {
            // Trying parse JSON response
            data = JSON.parse(response);
          } catch (e) {
            // Reject deffered promise if parsing failed
            log.error('Error parsing features data', e);
          }
        }
        // Resolve promise
        deffered.done(data);
        // Apply callbacks
        afterQueryCallbacks.forEach(function(callback) {
          callback(data);
        });
      }
    );
    // Returns deffered promise
    return deffered;
  };

  // Register callback that triggered before query starts
  var doBeforeQuery = function(callback) {
    beforeQueryCallbacks.push(callback);
  };

  // Register callback that triggered after query completes
  var doAfterQuery = function(callback) {
    afterQueryCallbacks.push(callback);
  };

  // Returns factory object
  return {
    query: reloadResource,
    doBeforeQuery: doBeforeQuery,
    doAfterQuery: doAfterQuery
  };

})(promise, moment, console);
