app.LeafletCommentsView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.collection, 'add', this.addOne);
  },

  render: function() {
    this.collection.forEach(function(item) { this.addOne(item, false); }, this);
    return this;
  },

  addOne: function(comment, startExanded) {
    var html = '<div class="commentMarker"><div class="dotdotdot">...</div><textarea placeholder="Type your comment">' + (comment.get('commentBody') || '') + '</textarea></div>';
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

    textarea.on('mouseout', function(event) {
      $(marker._icon).removeClass('expanded');
    });

    marker.on('click', function(event) {
      $(marker._icon).addClass('expanded');
    });

    if (startExanded) {
      $(marker._icon).addClass('expanded');
      textarea.focus();
    }
  },

  remove: function() {
    this.line.off('click', this.select, this);
    app.leaflet.removeLayer(this.line);
    Backbone.View.prototype.remove.apply(this, arguments);
  },
});
