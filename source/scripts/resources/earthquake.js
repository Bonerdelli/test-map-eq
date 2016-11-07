/* globals app, define */
'use strict';

/**
 * Resource for quering earthquake data from http://earthquake.usgs.gov
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

define('earthquake', ['promise', 'moment', 'message'],
function(promise, moment, message) {

  /**
   * Resource options
   * NOTE: this example doesn't need for global configuration
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
    this.data = null;
    this.options = options;
    this.beforeQueryCallbacks = [];
    this.afterQueryCallbacks = [];
  };

  /**
   * Query data with given options
   */
  EarthquakeResource.prototype.query = function(options) {
    var self = this;
    var queryOptions = {};
    var url = this.options.apiUrl;
    var deffered = new promise.Promise();
    // Apply callbacks
    this._beforeQuery();
    // Generate options for query
    options = options || {};
    app.extend(queryOptions, this.options.defaultQueryOptions);
    app.extend(queryOptions, options);
    // Quering API with a given options
    promise.get(url, queryOptions).then(
      function(error, response, xhr) {
        if (error) {
          // Reject deffered promise if no data was retrieved
          app.log.error('Error requesting features data', xhr.status);
          message.set('произошла ошибка загрузки данных', 'error');
        } else {
          try {
            // Trying parse JSON response
            self.data = JSON.parse(response);
          } catch (e) {
            // Reject deffered promise if parsing failed
            app.log.error('Error parsing features data', e);
            message.set('произошла ошибка обработки данных', 'error');
          }
        }
        // Apply callbacks
        self._afterQuery();
        // Resolve promise
        deffered.done(self.data);
      }
    );
    // Returns deffered promise
    return deffered;
  };

  /**
   * Clear last quried data
   */
  EarthquakeResource.prototype.clean = function() {
    this.data = null;
    this._afterQuery();
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

  /**
   * Execute before query callbacks
   */
  EarthquakeResource.prototype._beforeQuery = function() {
    if (this.beforeQueryCallbacks.length) {
      this.beforeQueryCallbacks.forEach(function(callback) {
        callback();
      });
    }
  };

  /**
   * Execute after query callbacks
   */
  EarthquakeResource.prototype._afterQuery = function() {
    var data = this.data;
    if (this.afterQueryCallbacks.length) {
      this.afterQueryCallbacks.forEach(function(callback) {
        callback(data);
      });
    }
  };


  // Returns an EarthquakeResource instance
  return new EarthquakeResource(options);

});
