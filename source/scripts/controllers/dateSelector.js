/* globals app */
'use strict';

/**
 * Controller for date range selection
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

app.define('dateSelector', ['Pikaday', 'earthquake', 'message', 'moment', 'document', 'console'],
function(Pikaday, earthquake, message, moment, doc/*, log*/) {

  /**
   * Calendar controller options
   * NOTE: this example doesn't need for global configuration
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
      format: 'LL',
      maxDate: moment().toDate(),
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
    this.dateSelected = {};
    this.elements = {};
    this.controls = {};
  };


  /**
   * Initializes date selector
   */
  DateSelectorController.prototype.initialize = function() {

    var self = this;
    var dateForm = doc.getElementById(options.formElementId);
    var fields = this.options.dateFields || [];

    // Iterate on date fields and initialize them
    fields.forEach(function(field) {

      var datePickerOpts = app.extend({}, options.pikaday);
      var dateInput = dateForm.elements[field.fieldName];

      // Set callback for date select
      var onDateSelect = function() {
        // Sets a new selected date
        var date = self.getMoment().format('YYYY-MM-DD');
        self.dateSelected[field.name] = date;
        // Reload earthquake data input changes
        earthquake.query({
          starttime: self.dateSelected.dateFrom,
          endtime: self.dateSelected.dateTo
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
      self.controls[field.name] = datePicker;
      self.elements[field.name] = dateInput;
    });

    // Disable inputs before query
    earthquake.doBeforeQuery(function() {
      self.elements.dateFrom.disabled = true;
      self.elements.dateTo.disabled = true;
    });

    // Enable inputs after query
    earthquake.doAfterQuery(function() {
      self.elements.dateFrom.disabled = false;
      self.elements.dateTo.disabled = false;
    });

  };

  // Returns a module
  return new DateSelectorController(options);

});
