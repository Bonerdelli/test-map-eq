/* globals window */

/**
 * Standalone asynchronous modules loader
 * AMD-like realization, but less complicated
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

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
    var dependency = this.require(deps[i]);
    if (typeof dependency === 'undefined') {
      undefArgs.push(i);
    }
    moduleArgs.push(dependency);
  }
  if (!undefArgs.length) {
    // Initialize module immediatly
    var module = moduleFactory.apply(this, moduleArgs);
    this._registerModule(moduleName, module);
  } else {
    // Or add it to unresolved list
    this.unresolvedDeps.push({
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
  if (typeof this.modules[moduleName] !== 'undefined') {
    // Check for registered module
    module = this.modules[moduleName];
  } else if (typeof window[moduleName] !== 'undefined') {
    // Or check global instead
    module = window[moduleName];
  } else {
    // Add for undefined list for delayed defines
    // this.undefinedList[moduleName] = {};
  }
  return module;
};

/**
 * Register callback for module ready state
 */
Loader.prototype.onReady = function(moduleName, callback) {
  this.onReadyCallbacks[moduleName] = callback;
};

/**
 * Method for resolve unresolved dependencies
 * Called when new dependency are added
 * @private
 */
Loader.prototype._tryResolveDependencies = function(withModule) {
  mainLoop: for (var i = 0; i < this.unresolvedDeps.length; i++) {
    var opts = this.unresolvedDeps[i];
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
      var dependency = this.require(withModule);
      opts.moduleArgs[depIndex] = dependency;
      opts.undefArgs.splice(undefIndex, 1);
      // Call module factory if all dependencies was resolved
      if (opts.undefArgs.length === 0) {
        var module = opts.factory.apply(this, opts.moduleArgs);
        this._registerModule(opts.name, module);
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
