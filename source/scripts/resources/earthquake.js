/* globals app */
'use strict';

/**
 * Resource for quering earthquake data from http://earthquake.usgs.gov
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

app.define('earthquake', ['promise', 'moment', 'console'],
function(promise, moment, log) {

  /**
   * Resource options
   * NOTE: this example doesn't needed global storage for configuration
   */
  var options = {
    apiUrl: 'http://earthquake.usgs.gov/fdsnws/event/1/query',
    defaultQueryOptions: {
      format:    'geojson',
      eventtype: 'earthquake',
      // Request data for a last week by default
      starttime:  moment().subtract(1, 'week').format('YYYY-MM-DD'),
      endtime:    moment().format('YYYY-MM-DD')
    }
  };

  /**
   * Messages controller constructor
   */
  var EarthquakeResource = function(options) {
    this.options = options;
    this.beforeQueryCallbacks = [];
    this.afterQueryCallbacks = [];
  };

  /**
   * Query data with given options
   */
  EarthquakeResource.prototype.query = function(options) {
    var queryOptions = {};
    var url = this.options.apiUrl;
    var deffered = new promise.Promise();
    // Apply callbacks
    if (this.beforeQueryCallbacks.length) {
      this.beforeQueryCallbacks.forEach(function(callback) {
        callback();
      });
    }
    // Generate options for query
    options = options || {};
    app.extend(queryOptions, this.options.defaultQueryOptions);
    app.extend(queryOptions, options);
    // Quering API with a given options
    var self = this;
    promise.get(url, queryOptions).then(
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
        if (self.afterQueryCallbacks.length) {
          self.afterQueryCallbacks.forEach(function(callback) {
            callback(data);
          });
        }
      }
    );
    // Returns deffered promise
    return deffered;
  };

  /**
   * Register callback that triggered before query starts
   */
  EarthquakeResource.prototype.doBeforeQuery = function(callback) {
    this.beforeQueryCallbacks.push(callback);
  };

  /**
   * Register callback that triggered after query completes
   */
  EarthquakeResource.prototype.doAfterQuery = function(callback) {
    this.afterQueryCallbacks.push(callback);
  };

  // Returns an EarthquakeResource instance
  return new EarthquakeResource(options);

});
