// Additional buttons on the bottom of the UI for new map and nearby lines
app.MapExtrasView = app.BaseView.extend({
  template: _.template('<div class="showHome">新地图</div><div class="showNearby">附近的线路</div>'),

  initialize: function() {
    this.listenTo(app.events, 'map:toggleNearby', this.toggleText);
  },

  events: {
    'click .showHome': 'showHome',
    'click .showNearby': 'toggle'
  },

  showHome: function() {
    app.events.trigger('app:showHome');
  },

  toggle: function() {
    app.events.trigger('map:toggleNearby', this.model.get('center'));
  },

  toggleText: function() {
    if (this.toggled) {
      this.$('.showNearby').html('附近的线路').removeClass('showing');
    } else {
      this.$('.showNearby').html('隐藏附近的线路').addClass('showing');
    }
    this.toggled = !this.toggled;
  },
});