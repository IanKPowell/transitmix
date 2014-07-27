app.LineView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(app.events, 'map:selectLine', this.selectLine);
    this.patternsView = new app.CollectionView({
      collection: this.model.get('patterns'),
      view: app.LeafletPatternView
    });
  },

  render: function() {
    // TODO: is this the right place for this?
    this.patternsView.render();
    return this;
  },

  selectLine: function(lineId) {
    if (lineId != this.model.id) return;

    this.editablePatternView = new app.LeafletEditablePatternView({
      model: this.model.get('patterns').at(0)
    });
    this.editablePatternView.render();
    this.editablePatternIndex = 0;
  }
});