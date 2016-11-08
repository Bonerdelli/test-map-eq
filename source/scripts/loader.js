/* globals window */
'use strict';

/**
 * Standalone asynchronous modules loader for browser
 * AMD-like realization, but less complicated
 * @author Andrei Nekrasov <bonerdelli@gmail.com>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

var loader = (function(global, log) {

  var loader;
  var Loader = function() {
    this.modules = {};
    this.onReadyCallbacks = {};
    this.unresolvedDeps = [];
  };

  /**
   * Define a new module
   */
  Loader.prototype.define = function(moduleName, deps, moduleFactory) {
    var moduleArgs = [];
    var undefArgs = [];
    // Requiring modules for module factory
    for (var i = 0; i < deps.length; i++) {
      var dependency = loader.require(deps[i]);
      if (typeof dependency === 'undefined') {
        undefArgs.push(i);
      }
      moduleArgs.push(dependency);
    }
    if (!undefArgs.length) {
      // Initialize module immediatly
      var module = moduleFactory.apply(loader, moduleArgs);
      loader._registerModule(moduleName, module);
    } else {
      // Or add it to unresolved list
      loader.unresolvedDeps.push({
        name: moduleName,
        factory: moduleFactory,
        moduleArgs: moduleArgs,
        undefArgs: undefArgs,
        depNames: deps
      });
    }
  };

  /**
   * Require an existing module
   */
  Loader.prototype.require = function(moduleName) {
    var module;
    if (typeof loader.modules[moduleName] !== 'undefined') {
      // Check for registered module
      module = loader.modules[moduleName];
    } else if (typeof global[moduleName] !== 'undefined') {
      // Or check global instead
      // log.warn('Require module from global namespace: ' + moduleName);
      module = global[moduleName];
    } else {

    }
    return module;
  };

  /**
   * Register callback on module ready
   */
  Loader.prototype.onReady = function(moduleName, callback) {
    loader.onReadyCallbacks[moduleName] = callback;
  };

  /**
   * Method for resolve unresolved dependencies
   * Called when new dependency are added
   * @private
   */
  Loader.prototype._tryResolveDependencies = function(withModule) {
    mainLoop: for (var i = 0; i < loader.unresolvedDeps.length; i++) {
      var opts = loader.unresolvedDeps[i];
      var depFound = false;
      var depIndex = -1;
      var undefIndex;
      // Iterate on undefined arguments for module factory
      undefLoop: for (undefIndex = 0; undefIndex < opts.undefArgs.length; undefIndex++) {
        depIndex = opts.undefArgs[undefIndex];
        if (opts.depNames[depIndex] === withModule) {
          // Newest defined module name is equal with unresolved dependency name
          // So dependency for undefined argument found
          depFound = true;
          break undefLoop;
        }
      }
      if (depFound && depIndex > -1) {
        // Resolve module dependency
        var dependency = loader.require(withModule);
        opts.moduleArgs[depIndex] = dependency;
        opts.undefArgs.splice(undefIndex, 1);
        // Call module factory if all dependencies was resolved
        if (opts.undefArgs.length === 0) {
          var module = opts.factory.apply(loader, opts.moduleArgs);
          loader._registerModule(opts.name, module);
        }
      }
    }
  };

  /**
   * Register a new module and execute callbacks
   * @private
   */
  Loader.prototype._registerModule = function(moduleName, module) {
    this.modules[moduleName] = module;
    // Execute callbacks for module ready state
    if (typeof this.onReadyCallbacks[moduleName] !== 'undefined') {
      var callback = this.onReadyCallbacks[moduleName];
      callback.call(this.modules[moduleName]);
    }
    // Try resolve dependencies with registered module
    // Also resolves circular dependencies
    if (this.unresolvedDeps && this.unresolvedDeps.length) {
      this._tryResolveDependencies(moduleName);
    } else {
      delete this.unresolvedDeps;
    }
  };


  // Mimic as AMD loader
  // NOTE: not tested, disabled
  // loader.define.amd = true;
  // loader.require.amd = true;

  loader = new Loader();
  return loader;

})(window, console);

// Register in global namespace
window.define = loader.define;
window.require = loader.require;
