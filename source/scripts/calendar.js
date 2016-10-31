/* globals Pikaday, document */
'use strict';

;(function(Pikaday, MapController, doc, log) {

  /**
   * A dumb object cloning method
   * NOTE: use it only for hashes
   */
  var clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  var options = {
    formElementId: 'dateSelectorForm',
    dateFields: [{
      name: 'dateFrom',
      fieldName: 'datefrom',
    }, {
      name: 'dateTo',
      fieldName: 'dateto',
    }],
    pikaday: {
      format: 'll', // NOTE: moment.js date format
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

  var dateControls = {};
  var dateForm = doc.getElementById(options.formElementId);

  options.dateFields.forEach(function(field) {
    var dateInput = dateForm.elements[field.fieldName];
    var datePickerOpts = clone(options.pikaday);
    datePickerOpts.field = dateInput;
    datePickerOpts.onSelect = function() {
      log.log(this.getMoment().format('Do MMMM YYYY'));
    };
    var datePicker = new Pikaday(datePickerOpts);
    dateControls[field.name] = datePicker;
  });

  return dateControls;

})(Pikaday, MapController, document, console);
