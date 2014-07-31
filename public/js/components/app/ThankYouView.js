app.ThankYouView = app.BaseView.extend({
  className: 'thankYouView',
  template: _.template($('#tmpl-ThankYouView').html()),
  serialize: function() { return {}; },
});