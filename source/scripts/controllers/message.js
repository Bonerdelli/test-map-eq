/* globals app */
'use strict';

/**
 * A simple message controller
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

app.define('message', ['moment', 'document', 'console'],
function(moment, doc/*, log*/) {

  // Controller options
  var options = {
    elementId: 'map',
    messageClass: null,
    element: null
  };

  /**
   * Messages controller constructor
   */
  var MessageController = function(options) {
    this.options = options;
    var elementId = options.elementId;
    options.element = doc.getElementById(elementId);
  };

  /**
   * Set message
   */
  MessageController.prototype.set = function(messageText, messageClass) {
    this.element.innerHTML = messageText;
    if (messageClass) {
      this.element.classList.add(messageClass);
      this.messageClass = messageClass;
    }
  };

  /**
   * Clear message
   */
  MessageController.prototype.clear = function() {
    this.element.innerHTML = '';
    if (this.messageClass) {
      this.element.classList.remove(this.messageClass);
      this.messageClass = null;
    }
  };

  // Returns a module
  return new MessageController(options);

});
