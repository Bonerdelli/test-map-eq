/* globals window */

/**
 * Application entry point
 * Uses simple AMD implementation
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

var app = (function(global, log) {

  var App = function() {
    this.modules = {};
    this.onReadyCallbacks = {};
  };

  /**
   * Define a new module
   */
  App.prototype.define = function(moduleName, deps, module) {
    var moduleArgs = [];
    for (var i = 0; i < deps.length; i++) {
      var dependency = this.require(deps[i]);
      moduleArgs.push(dependency);
    }
    this.modules[moduleName] = module.apply(this, moduleArgs);
    if (typeof this.onReadyCallbacks[moduleName] !== 'undefined') {
      var callback = this.onReadyCallbacks[moduleName];
      callback.call(this.modules[moduleName]);
    }
  };

  /**
   * Require an existing module
   */
  App.prototype.require = function(moduleName) {
    var module;
    if (typeof this.modules[moduleName] !== 'undefined') {
      // Check for registered module
      module = this.modules[moduleName];
    } else if (typeof global[moduleName] !== 'undefined') {
      // Or check global instead
      module = global[moduleName];
    } else {
      // No module found
      log.error('Can\'t found module: ' + moduleName);
    }
    return module;
  };

  /**
   * A simple object extending method
   */
  App.prototype.extend = function extend(target, src) {
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

})(window, console);

/**
 * Initializes application
 */

app.onReady('map', function() {
  this.initialize();
});

app.onReady('dateSelector', function() {
  this.initialize();
});
