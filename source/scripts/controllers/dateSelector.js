/* globals define */
'use strict';

/**
 * Controller for date range selection
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

define('dateSelector', ['Pikaday', 'MapController', 'earthquake', 'moment', 'document', 'console'],
function(Pikaday, MapController, earthquake, moment, doc/*, log*/) {

  /**
   * A dumb object cloning method
   * NOTE: use it only for hashes
   */
  var clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  /**
   * A simple object extending method
   * TODO: move to app.js
   */
  var extend = function(target, src) {
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
   * Calendar controller options
   */
  var options = {
    formElementId: 'dateSelectorForm',
    // Field definitions
    dateFields: [{
      name: 'dateFrom',
      fieldName: 'datefrom',
      defaultValue: moment().subtract(1, 'week').format('LL')
    }, {
      name: 'dateTo',
      fieldName: 'dateto',
      defaultValue: moment().format('LL')
    }],
    // Options for Pikaday library
    pikaday: {
      format:   'LL', // NOTE: moment.js date format
      maxDate:  moment().toDate(),
      firstDay: 1,
      i18n: {
        previousMonth: 'Пред. месяц',
        nextMonth: 'След. месяц',
        months: ['Январь','Февраль','Март','Апрель','Май','Июнь',
                 'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        weekdays: ['Понедельник','Вторник','Среда','Четверг',
                   'Пятница','Суббота','Воскресенье'],
        weekdaysShort: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
      }
    }
  };

  /**
   * Constructor for date selector controller
   */
  var DateSelectorController = function(options) {
    this.options = options;
    this.controls = {};
    this.elements = {};
    this.dateSelected = {};
  };


  /**
   * Initializes date selector
   */
  DateSelectorController.prototype.initialize = function() {
    var dateForm = doc.getElementById(options.formElementId);
    var fields = this.options.dateFields || [];

    // Iterate on date fields and initialize them
    fields.forEach(function(field) {

      var datePickerOpts = extend({}, options.pikaday);
      var dateInput = dateForm.elements[field.fieldName];

      // Set on date select callback
      var onDateSelect = function() {
        // Sets a new selected date
        var date = this.getMoment().format('YYYY-MM-DD');
        this.dateSelected[field.name] = date;
        // Reload earthquake data input changes
        earthquake.query({
          starttime: this.dateSelected.dateFrom,
          endtime: this.dateSelected.dateTo
        });
      };

      // Construct options
      datePickerOpts.onSelect = onDateSelect;
      datePickerOpts.field = dateInput;

      // Set a defalut value
      // datePickerOpts.defaultDate = field.defaultValue;
      dateInput.value = field.defaultValue;

      // Initialize date picker
      var datePicker = new Pikaday(datePickerOpts);
      this.controls[field.name] = datePicker;
      this.elements[field.name] = dateInput;
    });

    // Disable inputs before query
    earthquake.doBeforeQuery(function() {
      this.elements.dateFrom.disabled = true;
      this.elements.dateTo.disabled = true;
    });

    // Enable inputs after query
    earthquake.doAfterQuery(function() {
      this.elements.dateFrom.disabled = false;
      this.elements.dateTo.disabled = false;
    });

  };

  // Returns a module
  return new DateSelectorController(options);

});
