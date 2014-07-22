app.HomeView = app.BaseView.extend({
  className: 'homeView',

  templateId: '#tmpl-home-view',
  
  events: {
    'click .homeStartButton': 'createMap',
    'keydown': 'captureEnter',
  },
  
  createMap: function() {
    app.events.trigger('app:createMap');
  },

  captureEnter: function (event) {
    if (event.which === 13) {
      event.stopPropagation();
      event.preventDefault();
      this.createMap();
    }
  }
});
