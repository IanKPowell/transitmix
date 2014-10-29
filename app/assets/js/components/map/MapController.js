app.MapController = app.Controller.extend({
  initialize: function(options) {
    this.listenTo(app.events, 'map:selectLine',      this.selectLine);
    this.listenTo(app.events, 'map:clearSelection',  this.clearSelection);
    this.listenTo(app.events, 'map:addLine',         this.addLine);
    this.listenTo(app.events, 'map:deleteLine',      this.deleteLine);
    this.listenTo(app.events, 'map:toggleNearby',    this.toggleNearby);
    this.listenTo(app.events, 'map:addNearbyLine',   this.addNearbyLine);
    this.listenTo(app.events, 'map:toggleSettings',  this.toggleSettings);

    if (options.map) {
      this.map = options.map;
      this.setupViews(options.lineId);
    } else {
      var afterFetch = function(response) {
        this.map = new app.Map(response, { parse: true });
        this.setupViews(options.lineId);
      };
      $.getJSON('/api/maps/' + options.mapId, _.bind(afterFetch, this));
    }
  },

  trailMarkers: [],
  setupViews: function(lineId) {
    app.leaflet.setView(this.map.get('center'), this.map.get('zoomLevel'));

    this.linesView = new app.CollectionView({
      collection: this.map.get('lines'),
      view: app.LeafletLineView,
    });
    this.linesView.render();

    // Tiny view for the 'New Map' button in the bottom left
    this.mapExtrasView = new app.MapExtrasView({ model: this.map });
    $('body').append(this.mapExtrasView.render().el);

    // EXPERIMENT: Load and add trails data
    var center = this.map.get('center');
    var self = this;

    $.getJSON('https://api.outerspatial.com/v0/trailheads?near_lat=' + center[0] +'&near_lng=' + center[1] + '&opentrails=true', function(response) {
      response.data.features.forEach(function(trailhead) {
        var coords = trailhead.geometry.coordinates;
        var icon = L.MakiMarkers.icon({icon: 'embassy', color: '#055200', size: 'm'});
        var marker = L.marker([coords[1], coords[0]], { icon: icon });
        
        marker.addTo(app.leaflet);
        marker.bindPopup('Trailhead: ' + trailhead.properties.name);
        marker.on('click', function() { marker.openPopup(); });

        self.trailMarkers.push(marker);
      });
    });

    this.selectLine(lineId);
  },

  selectLine: function(lineId) {
    if (!lineId) {
      this.clearSelection();
      return;
    }

    if (this.editableLine && this.editableLine.isDrawing) {
      return;
    }

    if (this.mapSettingsView) this.removeSettings();

    this._teardownSelectionViews();

    var selectedLine = this.map.get('lines').get(lineId);
    this.editableLine = new app.LeafletEditableLineView({ model: selectedLine });
    this.editableLine.render();

    this.lineDetailsView = new app.LineDetailsView({ model: selectedLine });
    $('body').append(this.lineDetailsView.render().el);

    this.router.navigate('/map/' + this.map.id + '/line/' + lineId);
  },

  clearSelection: function() {
    this._teardownSelectionViews();

    this.mapDetailsView = new app.MapDetailsView({ model: this.map });
    $('body').append(this.mapDetailsView.render().el);

    this.router.navigate('/map/' + this.map.id);
  },

  _teardownSelectionViews: function() {
    if (this.editableLine) this.editableLine.remove();
    if (this.lineDetailsView) this.lineDetailsView.remove();
    if (this.mapDetailsView) this.mapDetailsView.remove();
  },

  addLine: function() {
    var afterSave = function(line) { app.events.trigger('map:selectLine', line.id); };
    var lines = this.map.get('lines');
    lines.create(this.map.getLineDefaults(), { success: afterSave });
  },

  deleteLine: function(lineId) {
    var line = this.map.get('lines').get(lineId);
    line.destroy();
    this.clearSelection();
  },

  // Loads nearby agencies & lines, then creates an associated view for them.
  _cachedNearby: undefined,

  toggleNearby: function(center) {
    if (this.showingNearby) {
      this.hideNearby();
    } else {
      this.showNearby(center);
    }
    this.showingNearby = !this.showingNearby;
  },

  showNearby: function(latlng) {
    if (this.mapSettingsView) this.removeSettings();

    if (this._cachedNearby) {
      this._showNearby(this._cachedNearby);
      return;
    }

    app.utils.getNearbyGTFS(latlng, function(nearby) {
      this._cachedNearby = nearby;
      this._showNearby(nearby);
    }, this);
  },

  _showNearby: function(nearby) {
    var maps = new app.Maps(nearby, { parse: true });
    this.nearbyView = new app.NearbyView({ collection: maps });
    $('body').append(this.nearbyView.render().el);
  },

  hideNearby: function() {
    this.nearbyView.remove();
  },

  addNearbyLine: function(line) {
    app.utils.getNearbyCoordinates(line.get('mapId'), line.id, function(coordinates) {
      var lines = this.map.get('lines');

      var attrs = _.clone(line.attributes);
      delete attrs.id;
      delete attrs.mapId;

      var lineDefaults = this.map.getLineDefaults();

      _.extend(attrs, lineDefaults, { coordinates: coordinates });

      var afterCreate = function(line) {
        app.events.trigger('map:selectLine', line.id);
      };
      lines.create(attrs, { success: afterCreate });
    }, this);
  },

  toggleSettings: function() {
    if (this.mapSettingsView) {
      this.removeSettings();
      return;
    }

    this.mapSettingsView = new app.MapSettingsView({ model: this.map });
    $('body').append(this.mapSettingsView.render().el);
  },

  removeSettings: function() {
    this.mapSettingsView.remove();
    this.mapSettingsView = false;
  },

  teardownViews: function() {
    // Get rid of the trail markers
    this.trailMarkers.forEach(function(m) { app.leaflet.removeLayer(m); });

    this._teardownSelectionViews();
    this.linesView.remove();
    if (this.nearbyView) this.nearbyView.remove();
    if (this.mapSettingsView) this.removeSettings();
    this.mapExtrasView.remove();
  },
});
