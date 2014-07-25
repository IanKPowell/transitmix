// View that shows all the routes drawn, and lets you jump into any of them.
app.MapDetailsView = app.BaseView.extend({
  className: 'mapDetailsView',

  normalTemplate: _.template($('#tmpl-MapDetailsView').html()),
  emptyTemplate: _.template($('#tmpl-MapDetailsView-empty').html()),

  events: {
    'click .add': 'addLine',
    'click .remix': 'remix',
    'click .remixedFrom': 'remixedFrom',
    'click .share': 'showShare',
    'mouseleave': 'hideShare',
    'click .addComment': 'startAddingComment', 
  },

  isCommenting: false,

  startAddingComment: function() {
    this.isCommenting = true;

    var comments = this.model.get('comments');
    var finish = _.bind(this.stopAddingComment, this);
    this.$('.actions').hide();

    $('body').append('<div class="commentNotification NotificationView">Click anywhere to add a comment</div>');
    app.leaflet.once('click', function(event) {
      comments.add({ latlng: event.latlng });
      finish();
    });
  },

  stopAddingComment: function() {
    this.isCommenting = false;
    this.$('.actions').show();
    $('.commentNotification').remove();
  },

  serialize: function() {
    var attrs = _.clone(this.model.attributes);
    
    // TODO: Give the map model a function to compute it's summary statistics
    var lines = this.model.get('lines');
    var totalDistance = 0;
    var totalCost = 0;
    var totalBuses = 0;

    lines.forEach(function(line) {
      var calcs = line.getCalculations();

      totalDistance += calcs.distance;
      totalCost += calcs.total.cost;
      totalBuses += calcs.total.buses;
    }, this);

    return _.extend(attrs, { 
      lineCount: lines.length,
      cost: app.utils.formatCost(totalCost),
      distance: totalDistance.toFixed(2),
      buses: totalBuses,
    });
  },

  views: function() {
    var lineCollectionView = new app.CollectionView({
      collection: this.model.get('lines'),
      view: app.MapDetailsItemView,
    });

    return {
      '.lines': lineCollectionView,
    };
  },

  beforeRender: function() {
    var lines = this.model.get('lines');
    this.template = lines.length ? this.normalTemplate : this.emptyTemplate;
  },

  addLine: function() {
    app.events.trigger('map:addLine');
  },

  showShare: function() {
    var url = app.utils.getBaseUrl() + '/map/' + this.model.id;
    var $inputField = this.$('.sharebox>input');

    $inputField.val(url);
    this.$('.sharebox').show();
    $inputField.select();
  },

  hideShare: function() {
    this.$('.sharebox').hide();
  },

  remix: function() {
    app.events.trigger('app:remixMap', this.model.id);
  },

  remixedFrom: function() {
    app.events.trigger('app:showMap', this.model.get('remixedFromId'));
  },

  remove: function() {
    this.stopAddingComment();
    app.BaseView.prototype.remove.apply(this, arguments);
  },
});
