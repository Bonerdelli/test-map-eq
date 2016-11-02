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
  };

  App.prototype.define = function(moduleName, deps, module) {
    var moduleArgs = [];
    for (var i = 0; i < deps.length; i++) {
      var dependency = this.require(deps[i]);
      moduleArgs.push(dependency);
    }
    this.modules[moduleName] = module.apply(this, moduleArgs);
  };

  App.prototype.require = function(moduleName) {
    var module;
    if (this.modules[moduleName] !== undefined) {
      // Check for registered module
      module = this.modules[moduleName];
    } else if (global[moduleName] !== undefined) {
      // Or check global instead
      module = global[moduleName];
    } else {
      // No module found
      log.error('Can\'t found module: ' + moduleName);
    }
    return module;
  };

  return new App();

})(window, console);

// Initializes an application
app.require('map').initialize();
