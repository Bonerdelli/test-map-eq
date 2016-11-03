/* globals app */
'use strict';

/**
 * Controller for date range selection
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

app.define('dateSelector', ['Pikaday', 'earthquake', 'message', 'moment'],
function(Pikaday, earthquake, message, moment) {

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
      defaultValue: moment().subtract(1, 'week')
    }, {
      name: 'dateTo',
      fieldName: 'dateto',
      defaultValue: moment()
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
    var dateForm = app.doc.getElementById(options.formElementId);
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
        // Reload earthquake data
        self._onDateChange();
      };

      // Construct options
      datePickerOpts.onSelect = onDateSelect;
      datePickerOpts.field = dateInput;

      // Set a defalut value
      // datePickerOpts.defaultDate = field.defaultValue;
      dateInput.value = field.defaultValue.format('LL');
      self.dateSelected[field.name] = field.defaultValue;

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

    earthquake.doAfterQuery(function() {
      // Enable inputs after query
      self.elements.dateFrom.disabled = false;
      self.elements.dateTo.disabled = false;
      // Set a message with duration between selected dates
      var diff = moment(self.dateSelected.dateFrom)
           .diff(moment(self.dateSelected.dateTo));
      app.log.debug(self.dateSelected.dateFrom, self.dateSelected.dateTo, diff);
      var duration = moment.duration(diff).humanize();
      message.set('показаны данные за ' + duration);
    });

    // Quering default data range at startup
    this._onDateChange();

  };

  /**
   * On date change callback
   */
  DateSelectorController.prototype._onDateChange = function() {
    // Reload earthquake data input changes
    earthquake.query({
      starttime: this.dateSelected.dateFrom,
      endtime: this.dateSelected.dateTo
    });
  };

  // Returns a module
  return new DateSelectorController(options);

});
