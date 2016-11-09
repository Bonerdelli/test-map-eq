/* globals app, define */
'use strict';

/**
 * Resource for quering earthquake data from http://earthquake.usgs.gov
 * @author Andrei Nekrasov <bonerdelli@gmail.com>
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
    apiUrl: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
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
    this.callbacks = {};
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
    this._execCallbacks('beforeQuery');
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
        self._execCallbacks('afterQuery');
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
    this._execCallbacks('afterClean');
    this.data = null;
  };

  /**
   * Register callback method for an event
   */
  EarthquakeResource.prototype.on = function(eventName, callback) {
    if (this.callbacks[eventName] === undefined) {
      this.callbacks[eventName] = [callback];
    } else {
      this.callbacks[eventName].push(callback);
    }
  };

  /**
   * Execute callbacks for event
   */
  EarthquakeResource.prototype._execCallbacks = function(eventName) {
    var data = this.data;
    if (this.callbacks[eventName] && this.callbacks[eventName].length) {
      this.callbacks[eventName].forEach(function(callback) {
        callback(data);
      });
    }
  };

  // Returns an EarthquakeResource instance
  return new EarthquakeResource(options);

});
