/* globals Pikaday, document */
'use strict';

;(function(Pikaday, doc, log) {

  var options = {
    formElementId: 'dateSelectorForm',
    dateFields: [{
      name: 'dateFrom',
      fieldName: 'datefrom',
    }, {
      name: 'dateTo',
      fieldName: 'dateto',
    }]
  };

  log.info('Initialize date picker controls');
  var dateForm = doc.getElementById(options.formElementId);
  var dateControls = {};

  options.dateFields.forEach(function(field) {
    var dateInput = dateForm.elements[field.fieldName];
    var datePicker = new Pikaday({
      field: dateInput,
      onSelect: function() {
        log.log(this.getMoment().format('Do MMMM YYYY'));
      }
    });
    dateControls[field.name] = datePicker;
  });

  return dateControls;

})(Pikaday, document, console);
