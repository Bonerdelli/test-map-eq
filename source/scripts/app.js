/* globals document, Loader */

/**
 * Application entry point
 * Contains some helper methods
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */


var app = (function(doc, log) {

  var App = function() {
    Loader.call(this);
    this.doc = doc;
    this.log = log;
  };

  // Inherits from loader class
  App.prototype = Object.create(Loader.prototype);
  App.prototype.constructor = App;

  /**
   * A simple object extending method
   */
  App.prototype.extend = function extend(target, source) {
    target = target || {};
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        if (typeof source[prop] === 'object') {
          target[prop] = extend(target[prop], source[prop]);
        } else if (typeof source[prop] !== 'undefined') {
          target[prop] = source[prop];
        }
      }
    }
    return target;
  };

  /**
   * A dumb object cloning method
   * NOTE: use it only for hashes
   */
  App.prototype.clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  /**
   * Register callback on module ready
   */
  App.prototype.onReady = function(moduleName, callback) {
    this.onReadyCallbacks[moduleName] = callback;
  };

  return new App();

})(document, console);

/**
 * Initializes application
 */

app.onReady('map', function() {
  this.initialize();
});

app.onReady('dateSelector', function() {
  this.initialize();
});
