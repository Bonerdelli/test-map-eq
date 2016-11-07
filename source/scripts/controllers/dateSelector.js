/* globals app, define */
'use strict';

/**
 * Controller for date range selection
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @package avnk-testwork-earthquake-map
 * @year 2016
 */

define('dateSelector', ['Pikaday', 'earthquake', 'message', 'moment'],
function(Pikaday, earthquake, message, moment) {

  /**
   * Calendar controller options
   * NOTE: this example doesn't need for global configuration
   */
  var options = {
    maxPeriod: 30, // Maximum period, in days
    formElementId: 'dateSelectorForm',
    dateValueFormat: 'YYYY-MM-DD',
    dateDisplayFormat: 'LL',
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
    var dateValueFormat = this.options.dateValueFormat;
    var dateForm = app.doc.getElementById(options.formElementId);
    var fields = this.options.dateFields || [];

    // Iterate on date fields and initialize them
    fields.forEach(function(field) {

      var datePickerOpts = app.extend({}, options.pikaday);
      var dateInput = dateForm.elements[field.fieldName];

      // Set callback for date select
      var onDateSelect = function() {
        // Sets a new selected date
        var date = this.getMoment().format(dateValueFormat);
        self.dateSelected[field.name] = date;
        // Reload earthquake data
        self._onDateChange();
      };

      // Construct options
      datePickerOpts.onSelect = onDateSelect;
      datePickerOpts.field = dateInput;

      // Set a defalut value
      // datePickerOpts.defaultDate = field.defaultValue;
      dateInput.value = field.defaultValue.format(self.options.dateDisplayFormat);
      self.dateSelected[field.name] = field.defaultValue.format(dateValueFormat);

      // Initialize date picker
      var datePicker = new Pikaday(datePickerOpts);
      self.controls[field.name] = datePicker;
      self.elements[field.name] = dateInput;
    });

    earthquake.doBeforeQuery(function() {
      // Sets a loading message
      message.set('идёт загрузка данных', 'progress');
      // Disable inputs before query
      self.elements.dateFrom.disabled = true;
      self.elements.dateTo.disabled = true;
    });

    earthquake.doAfterQuery(function(data) {
      // Enable inputs after query
      self.elements.dateFrom.disabled = false;
      self.elements.dateTo.disabled = false;
      // Set a message with duration between selected dates
      var diff = moment(self.dateSelected.dateFrom, dateValueFormat)
           .diff(moment(self.dateSelected.dateTo, dateValueFormat));
      var duration = moment.duration(diff).humanize();
      if (data && data.features && data.features.length) {
        message.set('показаны данные за период в ' + duration);
      } else {
        message.set('нет данных за выбранный период', 'warning');
      }
    });

    // Quering default data range at startup
    this._onDateChange();

  };

  /**
   * On date change callback
   */
  DateSelectorController.prototype._onDateChange = function() {

    var format = this.options.dateValueFormat;
    var dateFrom = this.dateSelected.dateFrom;
    var dateTo = this.dateSelected.dateTo;
    var diff = moment(dateFrom, format)
         .diff(moment(dateTo, format));
    var duration = moment.duration(diff);

    if (duration >= 0) {
      // Check for correct period selected
      message.set('выбран неверный период', 'warning');
      earthquake.clean();
    } else if (duration.days() < -this.options.maxPeriod) {
      // Check if date exceed maximum period
      message.set('нет данных за выбранный период', 'warning');
      earthquake.clean();
    } else {
      // All OK, reload earthquake data
      earthquake.query({
        starttime: dateFrom,
        endtime: dateTo
      });
    }

  };

  // Returns a module
  return new DateSelectorController(options);

});
