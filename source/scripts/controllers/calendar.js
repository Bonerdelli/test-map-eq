/* globals Pikaday, MapController, EarthquakeResource, moment, document */
'use strict';

/**
 * Controller for date selection
 * @author Andrei Nekrasov <bonerdelli@gmail.com>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

var CalendarController = (function(Pikaday, MapController, EarthquakeResource, moment, doc, log) {

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
    dateFields: [{
      name: 'dateFrom',
      fieldName: 'datefrom',
      defaultValue: moment().subtract(1, 'week').format('LL')
    }, {
      name: 'dateTo',
      fieldName: 'dateto',
      defaultValue: moment().format('LL')
    }],
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

  var dateForm = doc.getElementById(options.formElementId);

  var controls = {};
  var dateSelected = {};
  var elements = {};

  // Iterate on date fields and initialize them
  options.dateFields.forEach(function(field) {

    var datePickerOpts = extend({}, options.pikaday);
    var dateInput = dateForm.elements[field.fieldName];

    // Set on date select callback
    var onDateSelect = function() {
      // Sets a new selected date
      var date = this.getMoment().format('YYYY-MM-DD');
      dateSelected[field.name] = date;
      // Reload earthquake data input changes
      EarthquakeResource.query({
        starttime: dateSelected.dateFrom,
        endtime: dateSelected.dateTo
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
    controls[field.name] = datePicker;
    elements[field.name] = dateInput;
  });


  // Disable inputs before query
  EarthquakeResource.doBeforeQuery(function() {
    elements.dateFrom.disabled = true;
    elements.dateTo.disabled = true;
  });

  // Enable inputs after query
  EarthquakeResource.doAfterQuery(function() {
    elements.dateFrom.disabled = false;
    elements.dateTo.disabled = false;
  });

  // Returns a factory object
  return {
    controls: controls,
    selected: dateSelected
  };

})(Pikaday, MapController, EarthquakeResource, moment, document, console);
