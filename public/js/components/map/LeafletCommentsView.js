app.LeafletCommentsView = Backbone.View.extend({
  initialize: function() {

    // when there is an add event, add the marker
    this.listenTo(this.collection, 'add', this.addOne);
  },

  render: function() {

    // for each comment, add a marker
    this.collection.forEach(this.addOne);
    return this;
  },

  addOne: function(comment) {
    var latlng = comment.get('latlng');
    L.marker(latlng).addTo(app.leaflet);
  },

  remove: function() {
    this.line.off('click', this.select, this);
    app.leaflet.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});
