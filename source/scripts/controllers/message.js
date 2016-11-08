/* globals app, define */
'use strict';

/**
 * A simple message controller
 * @author Andrei Nekrasov <bonerdelli@gmail.com>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

define('message', [], function() {

  // Controller options
  var options = {
    elementId: 'dateSelectorMessage',
    messageClass: null,
    elements: {}
  };

  /**
   * Messages controller constructor
   */
  var MessageController = function(options) {
    this.options = options;
    var elementId = options.elementId;
    var element = app.doc.getElementById(elementId);
    var textElement = element.querySelectorAll('.message')[0];
    this.elements = {
      container: element,
      text: textElement
    };
  };

  /**
   * Set message
   */
  MessageController.prototype.set = function(messageText, messageClass) {
    this._resetClass();
    this.elements.text.innerHTML = messageText;
    if (messageClass) {
      this.elements.container.classList.add(messageClass);
      this.messageClass = messageClass;
    }
  };

  /**
   * Clear message
   */
  MessageController.prototype.clear = function() {
    this._resetClass();
    this.elements.text.innerHTML = '';
  };
  /**
   * Reset message class
   */
  MessageController.prototype._resetClass = function() {
    if (this.messageClass) {
      this.elements.container.classList.remove(this.messageClass);
      this.messageClass = null;
    }
  };

  // Returns a module
  return new MessageController(options);

});
