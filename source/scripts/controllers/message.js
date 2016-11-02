/* globals define */
'use strict';

/**
 * A simple message controller
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

define('message', ['moment', 'document', 'console'],
function(/*moment, doc, log*/) {

  // Controller options
  var options = {
    elementId: 'map',
  };

  /**
   * Messages controller constructor
   */
  var MessageController = function(options) {
    this.options = options;
  };

  // Returns a module
  return new MessageController(options);

});
