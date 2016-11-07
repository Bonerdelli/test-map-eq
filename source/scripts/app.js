/* globals document, loader */
'use strict';

/**
 * Application entry point
 * Contains some helper methods
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */


var app = (function(loader, doc, log) {

  var App = function() {
    this.loader = loader;
    this.doc = doc;
    this.log = log;
  };

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

  return new App();

})(loader, document, console);

/**
 * Initializes application
 */

app.loader.onReady('map', function() {
  this.initialize();
});

app.loader.onReady('dateSelector', function() {
  this.initialize();
});
