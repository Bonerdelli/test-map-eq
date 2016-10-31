/* globals promise */
'use strict';

var EarthquakeResource = (function(promise, log) {

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

  var reloadResource = function(options) {
    options = options || {};
    var deffered = new promise.Promise();
    var queryOptions = extend(defaultQueryOptions, options);
    // Quering API with a given options
    promise.get(apiUrl, queryOptions)
    .then(function(error, response, xhr) {
      if (error) {
        // Reject deffered promise if no data was retrieved
        log.error('Error requesting features data', xhr.status);
        deffered.done([]); // NOTE: .reject();
      } else {
        var data;
        try {
          // Trying parse JSON response
          data = JSON.parse(response);
        } catch (e) {
          // Reject deffered promise if parsing failed
          log.error('Error parsing features data', e);
          deffered.done([]); // NOTE: .reject();
        }
        deffered.done(data);
      }
    });
    // Returns deffered promise
    return deffered;
  };

  // Returns factory object
  return {
    query: reloadResource
  };

})(promise, console);
