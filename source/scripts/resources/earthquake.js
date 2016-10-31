/* globals promise */
'use strict';

var EarthquakeResource = (function(promise, log) {

  /**
   * Resource options
   * NOTE: this example doesn't needed global storage for configuration
   */
  var apiUrl = 'http://earthquake.usgs.gov/fdsnws/event/1/query';
  var defaultQueryOptions =  {
    format:    'geojson',
    eventtype: 'earthquake',
    starttime: '2014-01-01',
    endtime:   '2014-01-02',
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
        } else {
          target[prop] = src[prop];
        }
      }
    }
    return target;
  };

  var afterQueryCallbacks = [];
  var reloadResource = function(options) {
    options = options || {};
    var deffered = new promise.Promise();
    var queryOptions = extend(options, defaultQueryOptions);
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
        deffered.done(data);
        afterQueryCallbacks.forEach(function(callback) {
          callback(data);
        });
      }
    );
    // Returns deffered promise
    return deffered;
  };

  // Register callback that triggered after query completes
  var doAfterQuery = function(callback) {
    afterQueryCallbacks.push(callback);
  };

  // Returns factory object
  return {
    query: reloadResource,
    doAfterQuery: doAfterQuery
  };

})(promise, console);
