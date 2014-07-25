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
    var html = '<div class="commentMarker"><textarea>' + (comment.get('commentBody') || '') + '</textarea></div>';
    var icon = L.divIcon({ className: 'ignoreLeaflet',  html: html });
    var latlng = comment.get('latlng');

    var marker = L.marker(latlng, {
      icon: icon,
    }).addTo(app.leaflet);

    var textarea = $(marker._icon).find('textarea');
    textarea.on('input', function() {
      comment.set('commentBody', textarea.val());
    });

    $(marker._icon).on('click', function() {
      textarea.focus();
    });

    marker.on('click', function(event) {
      $(event.originalEvent.target).addClass('expanded');
    });
  },

  remove: function() {
    this.line.off('click', this.select, this);
    app.leaflet.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});
